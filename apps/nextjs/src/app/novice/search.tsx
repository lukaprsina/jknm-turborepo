"use client";

import { Hits, InstantSearch } from "react-instantsearch";

import { ArticleAlgoliaCard } from "~/components/article-card";
import { algolia } from "~/lib/algolia";
import { articles_variants } from "../articles";
import { MyPagination } from "./pagination";
import {
  MySearchBox,
  MySortBy,
  MyStats,
  TimelineRefinement,
} from "./search-components";

export function Search() {
  return (
    <InstantSearch
      future={{ preserveSharedStateOnUnmount: true }}
      indexName="novice"
      searchClient={algolia.getClient()}
    >
      <div className="flex flex-col gap-4">
        <div className="flex flex-col items-center justify-between gap-2 sm:flex-row">
          <div className="flex items-center justify-between space-x-2">
            <MySearchBox />
          </div>
          <div className="flex flex-col items-center justify-between gap-6 text-nowrap sm:flex-row">
            <MySortBy
              items={[
                { value: "novice", label: "Najnovejše" },
                { value: "novice_date_asc", label: "Najstarejše" },
              ]}
            />
          </div>
        </div>
        <div className="flex w-full items-start justify-between">
          <TimelineRefinement attribute="year" />
          <MyStats />
        </div>
      </div>
      <Hits
        hitComponent={ArticleAlgoliaCard}
        classNames={{
          item: articles_variants(),
          list: "grid grid-cols-1 gap-4 sm:grid-cols-2 mb-6",
        }}
      />
      <MyPagination />
    </InstantSearch>
  );
}
