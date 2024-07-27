import type { Value } from "@udecode/plate-common/server";
import {
  ELEMENT_IMAGE,
  insertImage,
  insertMedia,
  insertMediaEmbed,
} from "@udecode/plate-media";
import mime from "mime/lite";

import type { PlateCloudEditor } from "./types";

export const uploadFile = async <V extends Value = Value>(
  editor: PlateCloudEditor<V>,
  file: File,
) => {
  const response = await fetch("/api/upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ filename: file.name, content_type: file.type }),
  });

  if (response.ok) {
    const { url, fields } = await response.json();

    const formData = new FormData();
    Object.entries(fields).forEach(([key, value]) => {
      formData.append(key, value as string);
    });
    formData.append("file", file);

    const uploadResponse = await fetch(url, {
      method: "POST",
      body: formData,
    });

    if (uploadResponse.ok) {
      const file_mime = mime.getType(file.name);
      // is image
      if (file_mime?.includes("image")) {
        console.log("Uploaded image to S3:", file.name);
        insertImage(editor, `${url}${fields.key}`);
      } else {
        console.log("Uploaded file to S3:", file.name);
        insertMediaEmbed(editor, {
          url: `${url}${fields.key}`,
          name: file.name,
        });
      }
    } else {
      console.error("S3 Upload Error:", uploadResponse);
      alert("Upload failed.");
    }
  } else {
    alert("Failed to get pre-signed URL.");
  }
};

export const uploadFiles = <V extends Value = Value>(
  editor: PlateCloudEditor<V>,
  files: Iterable<File>,
) => {
  for (const file of files) {
    void uploadFile(editor, file);
  }
};
