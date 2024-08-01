"use server";

import { NextResponse } from "next/server";
import { ListObjectsCommand, S3Client } from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";

import { env } from "~/env";

export async function GET() {
  try {
    const client = new S3Client({ region: env.AWS_REGION });
    const response = await client.send(
      new ListObjectsCommand({ Bucket: env.AWS_BUCKET_NAME }),
    );
    return NextResponse.json(response.Contents ?? []);
  } catch (error: unknown) {
    return NextResponse.json({ error });
  }
}

export async function POST(request: Request) {
  const { filename, content_type } = (await request.json()) as {
    filename: string;
    content_type: string;
  };

  try {
    const client = new S3Client({ region: env.AWS_REGION });
    const { url, fields } = await createPresignedPost(client, {
      Bucket: env.AWS_BUCKET_NAME,
      Key: filename, //uuidv4(),
      Conditions: [
        ["content-length-range", 0, 5 * 10485760], // up to 10 MB
        ["starts-with", "$Content-Type", content_type],
      ],
      Fields: {
        acl: "public-read",
        "Content-Type": content_type,
      },
      Expires: 600, // Seconds before the presigned post expires. 3600 by default.
    });

    return Response.json({ url, fields });
  } catch (error) {
    return Response.json({ error });
  }
}
