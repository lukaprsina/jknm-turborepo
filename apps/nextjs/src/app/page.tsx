import { auth } from "@acme/auth";

import { ShowDraftsProvider } from "~/components/drafts-provider";
import { api } from "~/trpc/server";
import { Shell } from "../components/shell";
import { ArticlesClient } from "./articles-client";

export default async function HomePageServer() {
  const session = await auth();

  /* await api.article.infinite.prefetchInfinite(
    {
      show_drafts: false,
      limit: 6 * 5,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      pages: 1,
    },
  ); */

  return (
    <Shell without_footer>
      <ShowDraftsProvider show_button={Boolean(session)}>
        <ArticlesClient />
      </ShowDraftsProvider>
    </Shell>
  );
}
