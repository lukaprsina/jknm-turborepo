"use server";

import { NextResponse } from "next/server";
import mime from "mime/lite";

import { upload_image } from "~/server/upload-image";

export async function POST(request: Request) {
  const request_json = (await request.json()) as { url?: string };
  const external_url = request_json.url;
  if (!external_url) return NextResponse.json({ success: 0 });

  const response = await fetch(external_url);
  let title = external_url.split("/").pop();

  let mime_type: string;
  if (!title) {
    console.error("Image doesn't have a title", external_url);
    title = "unknown_image.jpg";
    mime_type = "image/jpeg";
  } else {
    mime_type = mime.getType(title) ?? "image/*";
  }

  console.log({ response, title, mime_type });

  const blob = await response.blob();
  const file = new File([blob], title, { type: mime_type });

  if (mime_type.includes("image")) {
    console.log("Uploading image to S3:", `${file.name}`);
  } else {
    console.log(mime_type);
    alert("Podprte so samo slike.");
    return;
  }

  const image_url = await upload_image(file);

  if (image_url) {
    return NextResponse.json({
      success: 1,
      file: {
        url: image_url,
      },
    });
  } else {
    return NextResponse.json({
      success: 0,
    });
  }
}
