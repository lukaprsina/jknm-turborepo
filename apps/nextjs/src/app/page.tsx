import { api } from "~/trpc/server";
import { Shell } from "../components/shell";
import { ArticlesClient } from "./articles-client";

export default async function HomePageServer() {
  await api.article.infinite.prefetchInfinite(
    {
      limit: 6 * 5,
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      pages: 1,
    },
  );

  return (
    <Shell without_footer>
      <ArticlesClient />
    </Shell>
  );
}
