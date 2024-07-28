import type { PlateEditor, Value } from "@udecode/plate-common/server";
import { getPluginOptions } from "@udecode/plate-common/server";
import { insertImage } from "@udecode/plate-media";
import mime from "mime/lite";

import type { CloudPlugin } from "./types";
import { KEY_CLOUD } from "./createCloudPlugin";

export const uploadFile = async <V extends Value = Value>(
  editor: PlateEditor<V>,
  file: File,
) => {
  const file_mime = mime.getType(file.name);
  if (file_mime?.includes("image")) {
    console.log("Uploading image to S3:", file.name);
  } else {
    alert("Only images are supported.");
    return;
  }

  const response = await fetch("/api/upload", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ filename: file.name, content_type: file.type }),
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
      insertImage(editor, `${url}${fields.key}`);
    } else {
      console.error("S3 Upload Error:", uploadResponse);
      alert("Upload failed.");
    }
  } else {
    alert("Failed to get pre-signed URL.");
  }
};

export const uploadFiles = (
  editor: PlateEditor<Value>,
  files: Iterable<File>,
) => {
  const { upload_file_callback } = getPluginOptions<CloudPlugin>(
    editor,
    KEY_CLOUD,
  );
  if (!upload_file_callback) return;

  for (const file of files) {
    void upload_file_callback(editor, file);
  }
};
