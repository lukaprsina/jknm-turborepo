"use server";

import { NextResponse } from "next/server";
import mime from "mime/lite";

import { FileExistsError } from "~/lib/file-exists-error";
import { upload_file_to_s3 } from "~/server/upload-file-to-s3";

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

  const blob = await response.blob();
  const file = new File([blob], title, { type: mime_type });

  const referer = request.headers.get("Referer");

  const novica_url = referer?.split("/").slice(-1)[0];

  if (!novica_url) {
    return NextResponse.json({
      success: 0,
    });
  }

  const file_mime = mime.getType(file.name);
  if (!file_mime?.includes("image")) {
    console.warn("Wrong MIME type", file_mime);
    return;
  }

  let image_url: string | null = null;

  try {
    image_url = await upload_file_to_s3(novica_url, file);
  } catch (error: unknown) {
    if (error instanceof FileExistsError) {
      return NextResponse.json({
        success: 0,
        error,
      });
    }
  }

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
