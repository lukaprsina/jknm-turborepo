"use client";

import { useContext, useEffect, useMemo } from "react";
import { useIntersectionObserver } from "react-intersection-observer-hook";

import { ShowDraftsContext } from "~/components/drafts-provider";
import { api } from "~/trpc/react";
import { Articles } from "./articles";

export function useInfiniteArticles() {
  const drafts = useContext(ShowDraftsContext);
  const show_drafts = drafts?.[0] ?? false;

  const [article_api, test] = api.article.infinite.useSuspenseInfiniteQuery(
    {
      show_drafts: show_drafts,
      limit: 6 * 5,
    },
    {
      // maxPages: 100,
      getNextPageParam: (lastPage) => lastPage.nextCursor,
      getPreviousPageParam: (firstPage) => firstPage.nextCursor,
    },
  );

  const articles = useMemo(() => {
    console.log("pages", article_api.pages);
    const pages = article_api.pages;
    const last_page = pages[pages.length - 1]?.data;
    if (!last_page) return;
    // console.log("use memo", pages, last_page);

    return article_api.pages.flatMap((page) => page.data);
  }, [article_api.pages]);

  const [ref, { entry }] = useIntersectionObserver({
    threshold: 1,
  });

  useEffect(() => {
    if (entry?.isIntersecting) {
      void test.fetchNextPage();
    }
  }, [test, entry]);

  return { articles, ref, article_api };
}

export function ArticlesClient() {
  const { articles, ref } = useInfiniteArticles();

  return <Articles featured articles={articles} ref={ref} />;
}
