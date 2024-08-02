"use server";

import { NextResponse } from "next/server";
import mime from "mime/lite";

import { upload_image } from "~/server/upload-image";

export async function POST(request: Request) {
  const form_data = await request.formData();
  form_data.forEach((value, key) => {
    console.log(key, value);
  });

  const file = form_data.get("image");
  if (!(file instanceof File)) return;

  const file_mime = mime.getType(file.name);

  if (file_mime?.includes("image")) {
    console.log("Uploading image to S3:", `${file.name}`);
  } else {
    console.log(file_mime);
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
