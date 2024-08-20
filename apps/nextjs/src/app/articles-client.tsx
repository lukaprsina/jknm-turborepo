"use client";

import { useContext, useEffect, useRef } from "react";
import { useIntersectionObserver } from "react-intersection-observer-hook";

import type { Session } from "@acme/auth";

import { ShowDraftsContext } from "~/components/drafts-provider";
import { api } from "~/trpc/react";
import { Articles } from "./articles";

export function ArticlesClient({ session }: { session: Session | null }) {
  const drafts = useContext(ShowDraftsContext);
  const show_drafts = drafts?.[0] ?? false;

  /* const articles =
    session && showDrafts
      ? api.article.all_protected.useQuery()
      : api.article.all.useQuery(); */

  const articles = api.article.infinite.useInfiniteQuery(
    {
      show_drafts,
    },
    {
      getNextPageParam: (lastPage) => {
        // console.log("getNextPageParam", lastPage);
        const real_last_page = lastPage[0];
        if (!real_last_page) return null;

        return real_last_page.created_at;
      },
    },
  );

  const [ref, { entry }] = useIntersectionObserver({
    threshold: 1,
  });

  useEffect(() => {
    console.log("ArticlesClient", articles, entry);
  }, [articles, entry]);

  return <Articles featured articles={articles.data?.pages.at(0)} ref={ref} />;
}
