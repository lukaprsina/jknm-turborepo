"use server";

import { NextResponse } from "next/server";
import mime from "mime/lite";
import sharp from "sharp";

import { upload_file_to_s3 } from "~/server/upload-file-to-s3";

export async function POST(request: Request) {
  const form_data = await request.formData();
  /* form_data.forEach((value, key) => {
    console.log(key, value);
  }); */

  const file = form_data.get("image");
  if (!(file instanceof File)) return;

  const file_mime = mime.getType(file.name);

  if (file_mime?.includes("image")) {
    console.log("Uploading image to S3:", `${file.name}`);
  } else {
    console.warn("Wrong MIME type", file_mime);
    return;
  }

  const image_buffer = await file.arrayBuffer();
  const image_metadata = await sharp(image_buffer).metadata();
  const image_width = image_metadata.width;
  const image_height = image_metadata.height;

  const image_url = await upload_file_to_s3(file);

  if (image_url) {
    return NextResponse.json({
      success: 1,
      file: {
        url: image_url,
        width: image_width,
        height: image_height,
      },
    });
  } else {
    return NextResponse.json({
      success: 0,
    });
  }
}
