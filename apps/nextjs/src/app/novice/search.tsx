"use client";

import { Hits, InstantSearch } from "react-instantsearch";

import { algoliaInstance } from "~/lib/algolia";
import {
  ArticleHit,
  CustomSearchBox,
  CustomSortBy,
  Timeline,
} from "./search-components";

export function Search() {
  return (
    <InstantSearch
      future={{ preserveSharedStateOnUnmount: true }}
      indexName="novice"
      searchClient={algoliaInstance.getClient()}
    >
      <div className="flex flex-col pb-4 sm:flex-row">
        <CustomSearchBox />
        <CustomSortBy
          items={[
            { value: "novice", label: "Najnovejše" },
            { value: "novice_date_asc", label: "Najstarejše" },
          ]}
        />
      </div>
      <Timeline />
      <Hits
        hitComponent={ArticleHit}
        classNames={{
          list: "grid grid-cols-1 gap-4 sm:grid-cols-2",
        }}
      />
    </InstantSearch>
  );
}
