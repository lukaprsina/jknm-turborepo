"use client";

import { useState } from "react";

import { api } from "~/trpc/react";
import { DataTableDemo } from "./demo";

export function ArticleTable() {
  const [offset, setOffset] = useState(0);
  const article_count = api.article.count.useQuery();
  const article_with_offset = api.article.allWithOffset.useQuery({
    offset,
  });

  return (
    <>
      <DataTableDemo />
    </>
  );
}
