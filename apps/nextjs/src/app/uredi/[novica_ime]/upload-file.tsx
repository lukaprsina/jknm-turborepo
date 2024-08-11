"use client";

import type EditorJS from "@editorjs/editorjs";
import mime from "mime/lite";

import type { useToast } from "@acme/ui/use-toast";

import type { FileUploadResponse } from "~/app/api/upload_file_to_s3/route";
import { settings_store } from "./settings-store";

export async function upload_image_by_file(
  file: File,
  toast: ReturnType<typeof useToast>,
): Promise<FileUploadResponse> {
  const novica_url = `${settings_store.get.url()}-${settings_store.get.id()}`;
  const error_response = {
    success: 0,
  } as const;

  if (!novica_url) {
    return error_response;
  }

  const file_mime = mime.getType(file.name);
  if (!file_mime?.includes("image")) {
    console.warn("Wrong MIME type", file_mime);
    return error_response;
  }

  const formData = new FormData();
  formData.append("file", file);
  formData.append("directory", novica_url);

  const file_data = await fetch("/api/upload_file_to_s3", {
    method: "POST",
    body: formData,
  });

  return await parse_s3_response(file_data, toast, novica_url, file.name);
}

export async function upload_image_by_url(
  url: string,
  toast: ReturnType<typeof useToast>,
): Promise<FileUploadResponse> {
  const novica_url = `${settings_store.get.url()}-${settings_store.get.id()}`;
  const title = url.split("/").pop();
  if (!title) {
    console.error("Image doesn't have a title", url);
    return {
      success: 0,
    };
  }

  const formData = new FormData();
  formData.append("url", url);
  formData.append("title", title);
  formData.append("directory", novica_url);

  const file_data = await fetch("/api/upload_file_to_s3", {
    method: "POST",
    body: formData,
  });

  return await parse_s3_response(file_data, toast, novica_url, title, editor);
}

export async function parse_s3_response(
  file_data: Response,
  toast: ReturnType<typeof useToast>,
  novica_url: string,
  filename: string,
): Promise<FileUploadResponse> {
  const error_response = {
    success: 0,
  } as const;

  const file_json = (await file_data.json()) as FileUploadResponse;

  /* function InsertImageToast() {
    return (
      <ToastAction
        altText="Vstavi sliko"
        onClick={() => {
          const image_data = settings_store.get.image_data();

          const found_image = image_data.find((image) => {
            const url_split = image.url.split("/");
            const image_name = url_split[url_split.length - 1];
            console.log({ image_name, filename });

            return image_name === filename;
          });

          if (!found_image) {
            console.error("Image not found", filename);
            return;
          }

          console.log("inserting image", found_image, editor);

          return {
            success: 1,
            file: found_image,
          };
        }}
      >
        Vstavi sliko
      </ToastAction>
    );
  } */

  if (file_data.ok) {
    if (file_json.error == "File exists") {
      toast.toast({
        title: "Slika s takim imenom že obstaja",
        description: `Novica: ${novica_url}, ime: ${filename}`,
        // action: <InsertImageToast />, // TODO, maybe alert better
      });

      return {
        success: 0,
        error: "File exists",
      };
    }

    return {
      success: 1,
      file: file_json.file,
    };
  } else {
    console.error("Error uploading file: !file_data.ok", file_data);
    return error_response;
  }
}
