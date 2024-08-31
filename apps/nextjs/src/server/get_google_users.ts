"use server";

import type { JWTInput } from "google-auth-library";
import { unstable_cache } from "next/cache";
import { google } from "googleapis";

import type { GoogleAdminUser } from "~/app/api/get_users/route";
import { env } from "~/env";

export const get_google_users = unstable_cache(
  get_google_users_no_cache,
  ["lol"],
  { tags: ["get_users"] },
);

async function get_google_users_no_cache() {
  console.log("GETTING GOOGLE USERS");
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
    // revalidateTag("get_users");
    return;
  }

  const mapped_users = result.data.users.map(
    (user) =>
      ({
        id: user.id ?? undefined,
        email: user.primaryEmail ?? undefined,
        name: user.name?.fullName ?? undefined,
        suspended: user.suspended ?? undefined,
        thumbnail: user.thumbnailPhotoUrl ?? undefined,
      }) satisfies GoogleAdminUser,
  );

  /* mapped_users.push({
    id: "Jamarji JKNM",
    email: "info@jknm.si",
    name: "Jamarji JKNM",
    suspended: false,
    // TODO
    thumbnail: "https://jknm-turborepo.vercel.app/android-chrome-512x512.png",
    // thumbnail: "https://jknm-turborepo.vercel.app/logo.svg",
  }); */

  console.log("GOT GOOGLE USERS", mapped_users.length);
  return mapped_users;
}
