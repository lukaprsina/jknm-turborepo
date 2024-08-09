import { auth } from "@acme/auth";

import { api } from "~/trpc/server";
import { Articles } from "./articles";

export async function ArticlesServer() {
  const session = await auth();

  const articles = session
    ? await api.article.allProtected()
    : await api.article.all();

  return <Articles featured articles={articles} />;
}
