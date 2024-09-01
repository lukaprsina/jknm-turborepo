import { auth } from "@acme/auth";

import { ShowDraftsProvider } from "~/components/drafts-provider";
import { api } from "~/trpc/server";
import { Shell } from "../components/shell";
import { ArticlesClient } from "./articles-client";

export default async function HomePageServer() {
  const session = await auth();
  // const infinite_articles = await api.article.last_n(50);

  const a = await api.article.infinite({
    show_drafts: false,
    limit: 6 * 5,
  });

  await api.article.infinite.prefetch({
    show_drafts: false,
    limit: 6 * 5,
  });

  await api.article.infinite.prefetchInfinite(
    {
      show_drafts: false,
      limit: 6 * 5,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      pages: 3,
    },
  );

  await api.article.infinite.prefetchInfinite(
    {
      show_drafts: false,
      limit: 6 * 5,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      pages: 1,
    },
  );

  /* await trpc_helpers.article.infinite.prefetchInfinite(
    {
      show_drafts: false,
      limit: 6 * 5,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      pages: 3,
    },
  ); */

  return (
    <Shell without_footer>
      <ShowDraftsProvider show_button={Boolean(session)}>
        <ArticlesClient /* initial_articles={infinite_articles} */ />
      </ShowDraftsProvider>
    </Shell>
  );
}
