"use client";

import { useEffect, useState } from "react";

import { sql } from "@acme/db";
import { db } from "@acme/db/client";
import { Button } from "@acme/ui/button";
import { Input } from "@acme/ui/input";

import { api } from "~/trpc/react";
import { peepee } from "./server";

export function ArticleTable() {
  /* const [offset, setOffset] = useState(0);
  const article_count = api.article.count.useQuery();
  const article_with_offset = api.article.allWithOffset.useQuery({
    offset,
  }); */
  const [search, setSearch] = useState("");
  const article_fts = api.article.fullTextSearch.useQuery(search);

  useEffect(() => {
    console.log(article_fts.data);
  }, [article_fts.data]);

  return (
    <>
      <Input
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
      <Button
        onClick={async () => {
          await peepee();
        }}
      >
        Search
      </Button>
    </>
  );
}
