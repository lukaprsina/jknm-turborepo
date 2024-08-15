"use client";

import { Hits, InstantSearch } from "react-instantsearch";

import { ArticleAlgoliaCard } from "~/components/article-card";
import { algolia } from "~/lib/algolia";
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
      <div className="flex flex-col items-center justify-between gap-2 py-6 sm:flex-row">
        <div className="flex items-center justify-between space-x-2">
          <MySearchBox />
          <MySortBy
            items={[
              { value: "novice", label: "Najnovejše" },
              { value: "novice_date_asc", label: "Najstarejše" },
            ]}
          />
        </div>
        <MyStats />
      </div>
      <TimelineRefinement attribute="year" />
      <Hits
        hitComponent={ArticleAlgoliaCard}
        classNames={{
          list: "grid grid-cols-1 gap-4 sm:grid-cols-2 mb-6",
        }}
      />
      <MyPagination />
    </InstantSearch>
  );
}
