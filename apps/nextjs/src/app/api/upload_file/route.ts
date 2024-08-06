"use server";

import { NextResponse } from "next/server";

import { upload_file_to_s3 } from "~/server/upload-file-to-s3";

export async function POST(request: Request) {
  const form_data = await request.formData();
  /* form_data.forEach((value, key) => {
    console.log(key, value);
  }); */

  const file = form_data.get("file");
  if (!(file instanceof File)) return;

  const referer = request.headers.get("Referer");

  const novica_url = referer?.split("/").slice(-1)[0];

  if (!novica_url) {
    return NextResponse.json({
      success: 0,
    });
  }

  const file_url = await upload_file_to_s3(novica_url, file);

  if (file_url) {
    return NextResponse.json({
      success: 1,
      file: {
        url: file_url,
        title: file.name,
        size: file.size,
      },
    });
  } else {
    return NextResponse.json({
      success: 0,
    });
  }
}
