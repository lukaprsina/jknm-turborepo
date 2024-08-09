// import { auth } from "@acme/auth";

import { auth } from "@acme/auth";

import { ShowDraftsProvider } from "~/components/drafts-provider";
import { Shell } from "../components/shell";
import { ArticlesClient } from "./articles-client";
import { ArticlesServer } from "./articles-server";

export default async function HomePageServer() {
  const session = await auth();

  const articles = session ? (
    <ArticlesClient session={session} />
  ) : (
    <ArticlesServer />
  );

  return (
    <ShowDraftsProvider>
      <Shell>
        {articles}
      </Shell>
    </ShowDraftsProvider>
  );
}
