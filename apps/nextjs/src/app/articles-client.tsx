"use client";

import { useContext } from "react";

import type { Session } from "@acme/auth";

import { ShowDraftsContext } from "~/components/drafts-provider";
import { api } from "~/trpc/react";
import { Articles } from "./articles";

export function ArticlesClient({ session }: { session: Session | null }) {
  //   const { data: session } = useSession();
  const drafts = useContext(ShowDraftsContext);
  const showDrafts = drafts?.[0] ?? false;

  const articles =
    session && showDrafts
      ? api.article.all_protected.useQuery()
      : api.article.all.useQuery();

  return <Articles featured articles={articles.data ?? []} />;
}
