// This is an example of how to read a JSON Web Token from an API route
import { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

import { env } from "~/env";

export default async function GET(request: NextRequest) {
  // If you don't have NEXTAUTH_SECRET set, you will have to pass your secret as `secret` to `getToken`
  const token = await getToken({ req: request, secret: env.NEXTAUTH_SECRET });
  if (token) {
    // Signed in
    console.log("JSON Web Token", JSON.stringify(token, null, 2));
  } else {
    // Not Signed in
    res.status(401);
  }
  res.end();
}
