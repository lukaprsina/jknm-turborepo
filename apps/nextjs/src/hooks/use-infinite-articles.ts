"use client";

import { useContext, useEffect, useMemo } from "react";
import { useIntersectionObserver } from "react-intersection-observer-hook";

import type { Article } from "@acme/db/schema";

import { ShowDraftsContext } from "~/components/drafts-provider";
import { api } from "~/trpc/react";

export function useInfiniteArticles(
  _initial_articles: (typeof Article.$inferSelect)[],
) {
  const drafts = useContext(ShowDraftsContext);
  const show_drafts = drafts?.[0] ?? false;

  const article_api = api.article.infinite.useInfiniteQuery(
    {
      show_drafts: show_drafts,
      limit: 6 * 5,
    },
    {
      // maxPages: 100,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      getPreviousPageParam: (firstPage) => firstPage.nextCursor,
      /* initialData: {
        pages: [
          {
            data: initial_articles,
            nextCursor: undefined,
          },
        ],
        pageParams: [],
      }, */
    },
  );

  const articles = useMemo(() => {
    const pages = article_api.data?.pages;
    if (!pages) return;
    const last_page = pages[pages.length - 1]?.data;
    if (!last_page) return;
    console.log("use memo", pages, last_page);

    return article_api.data?.pages.flatMap((page) => page.data);
  }, [article_api.data?.pages]);

  const [ref, { entry }] = useIntersectionObserver({
    threshold: 1,
  });

  useEffect(() => {
    if (entry?.isIntersecting) {
      void article_api.fetchNextPage();
    }
  }, [article_api, entry]);

  return { articles, ref, article_api };
}
