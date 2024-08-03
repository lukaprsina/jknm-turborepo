"use server";

import {
  DeleteObjectsCommand,
  ListObjectsV2Command,
  S3Client,
} from "@aws-sdk/client-s3";

import { env } from "~/env";

async function list_objects(prefix: string) {
  try {
    const client = new S3Client({ region: env.AWS_REGION });
    const response = await client.send(
      new ListObjectsV2Command({
        Bucket: env.AWS_BUCKET_NAME,
        Prefix: prefix,
      }),
    );
    return response.Contents ?? [];
  } catch (error) {
    console.error("Error listing objects:", error);
    throw error;
  }
}

async function delete_objects(keys: string[]) {
  try {
    const client = new S3Client({ region: env.AWS_REGION });
    const response = await client.send(
      new DeleteObjectsCommand({
        Bucket: env.AWS_BUCKET_NAME,
        Delete: { Objects: keys.map((Key) => ({ Key })) },
      }),
    );

    return response;
  } catch (error) {
    console.error("Error listing objects:", error);
    throw error;
  }
}

export async function clean_directory(
  directory: string,
  filenames_to_keep: string[],
) {
  try {
    const objects = await list_objects(directory);
    const keys_to_delete = objects
      .map((object) => object.Key)
      .filter(
        (key) =>
          key !== undefined &&
          !filenames_to_keep.includes(key.replace(`${directory}/`, "")),
      );

    if (keys_to_delete.length > 0)
      await delete_objects(keys_to_delete.filter((key) => key !== undefined));
  } catch (error) {
    console.error("Error cleaning directory:", error);
  }
}
