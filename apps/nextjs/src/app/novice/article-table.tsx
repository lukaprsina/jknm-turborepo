"use client";

import { useEffect, useState } from "react";
import { useDebouncedCallback } from "use-debounce";

import { Input } from "@acme/ui/input";

import { api } from "~/trpc/react";
import { Articles } from "../articles";

export function ArticleTable() {
  /* const [offset, setOffset] = useState(0);
  const article_count = api.article.count.useQuery();
  const article_with_offset = api.article.allWithOffset.useQuery({
    offset,
  }); */
  const [search, setSearch] = useState("");
  const debounced = useDebouncedCallback(() => {
    if (search.length == 0) return "";

    return `${search.trim().replace(/ /g, "+")}:*`;
  }, 500);

  const article_fts = api.article.fullTextSearch.useQuery({
    search: debounced() ?? "",
  });

  useEffect(() => {
    console.log(article_fts.data);
  }, [article_fts.data]);

  return (
    <div className="prose lg:prose-xl dark:prose-invert pt-6">
      <Input
        value={search}
        onChange={(event) => {
          setSearch(event.target.value);
        }}
      />
      {article_fts.data ? <Articles articles={article_fts.data} /> : null}
    </div>
  );
}
