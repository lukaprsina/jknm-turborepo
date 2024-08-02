"use server";

import mime from "mime/lite";

export async function upload_image_by_url(url: string) {
  console.log("by url");
  const response = await fetch(url);
  let title = url.split("/").pop();

  let mime_type: string;
  if (!title) {
    console.error("Image doesn't have a title", url);
    title = "unknown_image.jpg";
    mime_type = "image/jpeg";
  } else {
    mime_type = mime.getType(title) ?? "image/*";
  }

  console.log({ response, title, mime_type });

  const blob = await response.blob();
  const file = new File([blob], title, { type: mime_type });

  console.log({ file });
  const s3_response = await upload_image_by_file(file);
  console.log({ s3_response });
  return s3_response;
}

export async function upload_image_by_file(file: File) {
  const file_mime = mime.getType(file.name);

  if (file_mime?.includes("image")) {
    console.log("Uploading image to S3:", `${file.name}`);
  } else {
    console.log(file_mime);
    alert("Podprte so samo slike.");
    return;
  }

  const response = await fetch("/api/upload_image", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      // filename: `${article_url}/${file.name}`,
      filename: file.name,
      content_type: file.type,
    }),
  });

  if (response.ok) {
    const { url, fields } = (await response.json()) as {
      url: string;
      fields: Record<string, string>;
    };

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
      return {
        success: 1,
        file: {
          url: `${url}${fields.key}`,
        },
      };
    } else {
      alert("Image upload failed.");
      return {
        success: 0,
      };
    }
  } else {
    alert("Image upload: failed to get pre-signed URL.");
    return {
      success: 0,
    };
  }
}
