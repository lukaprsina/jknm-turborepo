"use server";

import { NextResponse } from "next/server";
import { S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";
import mime from "mime/lite";

import { env } from "~/env";

export async function POST(request: Request) {
  const request_json = await request.json();
  const image_url = request_json.url;
  if (!image_url) return NextResponse.json({ success: 0 });

  const response = await fetch(image_url);
  let title = image_url.split("/").pop();

  let mime_type: string;
  if (!title) {
    console.error("Image doesn't have a title", image_url);
    title = "unknown_image.jpg";
    mime_type = "image/jpeg";
  } else {
    mime_type = mime.getType(title) ?? "image/*";
  }

  console.log({ response, title, mime_type });

  const blob = await response.blob();
  const file = new File([blob], title, { type: mime_type });

  if (mime_type?.includes("image")) {
    console.log("Uploading image to S3:", `${file.name}`);
  } else {
    console.log(mime_type);
    alert("Podprte so samo slike.");
    return;
  }

  const client = new S3Client({ region: env.AWS_REGION });
  const { url, fields } = await createPresignedPost(client, {
    Bucket: env.AWS_BUCKET_NAME,
    Key: file.name, //uuidv4(),
    Conditions: [
      ["content-length-range", 0, 5 * 10485760], // up to 10 MB
      ["starts-with", "$Content-Type", file.type],
    ],
    Fields: {
      acl: "public-read",
      "Content-Type": file.type,
    },
    Expires: 600, // Seconds before the presigned post expires. 3600 by default.
  });

  const formData = new FormData();
  Object.entries(fields).forEach(([key, value]) => {
    formData.append(key, value);
  });
  formData.append("file", file);

  const uploadResponse = await fetch(url, {
    method: "POST",
    body: formData,
  });

  if (uploadResponse.ok) {
    return NextResponse.json({
      success: 1,
      file: {
        url: `${url}${fields.key}`,
      },
    });
  } else {
    alert("Image upload failed.");
    return NextResponse.json({
      success: 0,
    });
  }
}
