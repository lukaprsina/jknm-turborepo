"use client";

import { useContext } from "react";

import type { Session } from "@acme/auth";

import { ShowDraftsContext } from "~/components/drafts-provider";
import { api } from "~/trpc/react";
import { Articles } from "./articles";

export function ArticlesClient({ session }: { session: Session | null }) {
  //   const { data: session } = useSession();
  const [showDrafts] = useContext(ShowDraftsContext);

  const articles =
    session && showDrafts
      ? api.article.allProtected.useQuery()
      : api.article.all.useQuery();

  console.log(
    articles.data?.map((article) => [article.title, article.created_at]),
  );

  return <Articles articles={articles.data ?? []} />;
}
