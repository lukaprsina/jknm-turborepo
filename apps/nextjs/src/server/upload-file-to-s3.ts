"use server";

import { HeadObjectCommand, NotFound, S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";

import { env } from "~/env";
import { FileExistsError } from "~/lib/file-exists-error";

export async function upload_file_to_s3(directory: string, file: File) {
  const client = new S3Client({ region: env.AWS_REGION });
  const key = `${directory}/${file.name}`;

  const headObjectParams = {
    Bucket: env.AWS_BUCKET_NAME,
    Key: key,
  };

  try {
    await client.send(new HeadObjectCommand(headObjectParams));
    throw new FileExistsError(`File ${key} already exists`);
  } catch (error: unknown) {
    if (!(error instanceof NotFound)) throw error;
  }

  const { url, fields } = await createPresignedPost(client, {
    Bucket: env.AWS_BUCKET_NAME,
    Key: key, //uuidv4(),
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

  return uploadResponse.ok ? `${url}${fields.key}` : null;
}
