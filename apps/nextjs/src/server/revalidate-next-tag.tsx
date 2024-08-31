"use server";

import { revalidatePath, revalidateTag } from "next/cache";

// eslint-disable-next-line @typescript-eslint/require-await
export async function revalidate_next_tag(name: string) {
  revalidatePath("/api/get_users");
  console.log("revalidated tag", name);
  revalidateTag(name);
}
