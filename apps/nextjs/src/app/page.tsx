import { auth } from "@acme/auth";

import { ShowDraftsProvider } from "~/components/drafts-provider";
import { api } from "~/trpc/server";
import { Shell } from "../components/shell";
import { ArticlesClient } from "./articles-client";

export default async function HomePageServer() {
  const session = await auth();
  const infinite_articles = await api.article.last_n(50);

  return (
    <ShowDraftsProvider show_button={Boolean(session)}>
      <Shell without_footer>
        <ArticlesClient initial_articles={infinite_articles} />
      </Shell>
    </ShowDraftsProvider>
  );
}
