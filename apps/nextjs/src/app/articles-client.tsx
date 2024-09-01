"use client";

import type { Article } from "@acme/db/schema";

import { useInfiniteArticles } from "~/hooks/use-infinite-articles";
import { Articles } from "./articles";

export function ArticlesClient(/* {
  initial_articles,
}: {
  initial_articles: (typeof Article.$inferSelect)[];
} */) {
  const { articles, ref } = useInfiniteArticles(/* initial_articles */);

  return <Articles featured articles={articles} ref={ref} />;
}
