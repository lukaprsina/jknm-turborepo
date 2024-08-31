"use server";

import type { JWTInput } from "google-auth-library";
import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";
import { google } from "googleapis";

import { env } from "~/env";

export interface GoogleAdminUser {
  id?: string;
  email?: string;
  name?: string;
  suspended?: boolean;
  thumbnail?: string;
}

export async function GET() {
  const credentials_text = atob(env.JKNM_SERVICE_ACCOUNT_CREDENTIALS);
  const credentials_json = JSON.parse(credentials_text) as Partial<JWTInput>;
  const google_client = await google.auth.getClient({
    credentials: credentials_json,
    scopes: ["https://www.googleapis.com/auth/admin.directory.user.readonly"],
  });

  const service = google.admin({
    version: "directory_v1",
    auth: google_client,
  });

  const result = await service.users.list({
    customer: "C049fks0l",
  });

  if (!result.data.users) {
    console.error("No users found", result);
    revalidateTag("get_users");
    return NextResponse.error();
  }

  const mapped_users = result.data.users.map((user) => ({
    id: user.id ?? undefined,
    email: user.primaryEmail ?? undefined,
    name: user.name?.fullName ?? undefined,
    suspended: user.suspended ?? undefined,
    thumbnail: user.thumbnailPhotoUrl ?? undefined,
  }));

  mapped_users.push({
    id: "Jamarji JKNM",
    email: "info@jknm.si",
    name: "Jamarji JKNM",
    suspended: false,
    // TODO
    thumbnail: "https://jknm-turborepo.vercel.app/android-chrome-512x512.png",
    // thumbnail: "https://jknm-turborepo.vercel.app/logo.svg",
  });

  console.log("GETTING NEW USERS", mapped_users);
  return NextResponse.json(mapped_users);
}
