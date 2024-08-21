"use client";

import type { ArticleWithCreditedPeople } from "./articles";
import { useInfiniteArticles } from "~/hooks/use-infinite-articles";
import { Articles } from "./articles";

export function ArticlesClient({
  initial_articles,
}: {
  initial_articles: ArticleWithCreditedPeople[];
}) {
  const { articles, ref } = useInfiniteArticles(initial_articles);

  return <Articles featured articles={articles} ref={ref} />;
}
