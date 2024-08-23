"use server";

import { cookies } from "next/headers";
import { getToken } from "@auth/core/jwt";

import { env } from "~/env";

export async function get_jwt_token() {
  const all_cookies = cookies().getAll();
  const headers = new Headers();

  all_cookies.forEach((cookie) => {
    headers.set("cookie", `${cookie.name}=${cookie.value};`);
  });

  const req = {
    headers,
  };

  const secureCookie = env.NODE_ENV === "production";
  const cookieName = secureCookie
    ? "__Secure-authjs.session-token"
    : "authjs.session-token";

  const jwt = await getToken({
    req,
    secret: env.AUTH_SECRET,
    secureCookie,
    salt: cookieName,
  });
  console.log(jwt);
}
