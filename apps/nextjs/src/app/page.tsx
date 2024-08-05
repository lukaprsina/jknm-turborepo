// import { auth } from "@acme/auth";

import { auth } from "@acme/auth";

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
    <Shell>
      {articles}
      {/* <ArticlesClient session={session} /> */}
      {/* <ArticlesServer /> */}
    </Shell>
  );
}
