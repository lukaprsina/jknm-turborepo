"use server";

import { signIn, signOut } from "@acme/auth";

export async function sign_out() {
  await signOut({ redirectTo: "/" });
}

export async function sign_in() {
  await signIn("google", { redirectTo: "/" });
}
