"use client";

import { Hits, InstantSearch } from "react-instantsearch";

import { algoliaInstance } from "~/lib/algolia";
import {
  ArticleHit,
  CustomSearchBox,
  CustomSortBy,
  Timeline,
  TimelineItem,
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
      <Timeline>
        <TimelineItem year={2022} />
        <TimelineItem year={2023} />
        <TimelineItem year={2024} />
      </Timeline>
      <Hits
        hitComponent={ArticleHit}
        classNames={{
          list: "grid grid-cols-1 gap-4 sm:grid-cols-2",
        }}
      />
    </InstantSearch>
  );
}
