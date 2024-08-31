"use server";

import { revalidateTag } from "next/cache";

export async function revalidate_next_tag(name: string) {
  revalidateTag(name);
}
