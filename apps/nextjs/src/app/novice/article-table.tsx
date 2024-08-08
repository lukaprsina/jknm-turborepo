"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@acme/ui/button";
import { Input } from "@acme/ui/input";

import { ArticleCard } from "~/components/article-card";
import { api } from "~/trpc/react";

export function ArticleTable() {
  /* const [offset, setOffset] = useState(0);
  const article_count = api.article.count.useQuery();
  const article_with_offset = api.article.allWithOffset.useQuery({
    offset,
  }); */
  const [search, setSearch] = useState("");
  const query = useMemo(() => {
    if (search.length == 0) return "";

    return `${search.trim().replace(/ /g, "+")}:*`;
  }, [search]);

  const article_fts = api.article.fullTextSearch.useQuery({
    search: query,
  });

  useEffect(() => {
    console.log(query, article_fts.data?.length);
  }, [article_fts.data]);

  return (
    <>
      <Input
        value={search}
        onChange={(event) => {
          setSearch(event.target.value);
        }}
      />
      {article_fts.data?.map((article) => (
        <ArticleCard key={article.id} article={article} />
      ))}
    </>
  );
}
