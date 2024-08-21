"use client";

import type { RefinementListItem } from "instantsearch.js/es/connectors/refinement-list/connectRefinementList";
import type {
  UseRefinementListProps,
  UseSearchBoxProps,
  UseSortByProps,
} from "react-instantsearch";
// import { InstantSearchNext } from "react-instantsearch-nextjs";
import {
  useClearRefinements,
  useRefinementList,
  useSearchBox,
  useSortBy,
  useStats,
} from "react-instantsearch";

import { cn } from "@acme/ui";
import { Button } from "@acme/ui/button";
import { Input } from "@acme/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acme/ui/select";

export function MySortBy(props: UseSortByProps) {
  const { currentRefinement, options, refine } = useSortBy(props);

  return (
    <div className="flex items-center justify-between gap-2">
      <p>Razvrsti po</p>
      <Select
        onValueChange={(value) => refine(value)}
        value={currentRefinement}
      >
        <SelectTrigger>
          <SelectValue placeholder="Sortiraj po ..." />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}

const queryHook: UseSearchBoxProps["queryHook"] = (query, search) => {
  search(query);
};

export function MySearchBox() {
  const search_api = useSearchBox({ queryHook });

  return (
    <Input
      placeholder="Iskanje ..."
      value={search_api.query}
      onChange={(e) => search_api.refine(e.target.value)}
    />
  );
}

export function MyStats() {
  const stats = useStats();

  return (
    <p>
      {stats.processingTimeMS} ms, {stats.nbHits} novic
    </p>
  );
}

export function TimelineRefinement(
  props: Omit<UseRefinementListProps, "attribute">,
) {
  const refinement_list = useRefinementList({
    attribute: "year",
    sortBy: ["name:asc"],
    limit: 100,
    ...props,
  });
  const clear_refinements = useClearRefinements({
    includedAttributes: ["year"],
  });

  /* const sorted_list = useMemo(() => {
    const sorted_items = refinement_list.items.sort((a, b) => {
      return parseInt(a.value) - parseInt(b.value);
    });

    console.log({ sorted_items });
    return sorted_items;
  }, [refinement_list]); */

  return (
    <ol className="flex items-center justify-center pb-2 pl-1 sm:flex">
      {refinement_list.items.map((item) => (
        <TimelineItem
          onClick={() => {
            if (item.isRefined) {
              clear_refinements.refine();
            } else {
              clear_refinements.refine();
              refinement_list.refine(item.value);
            }
          }}
          key={item.value}
          item={item}
        />
      ))}
    </ol>
  );
}

export function TimelineItem({
  item,
  ...props
}: { item: RefinementListItem } & React.ComponentProps<typeof Button>) {
  return (
    <li className="relative mb-6 pl-2 sm:mb-0">
      <Button
        variant="link"
        className={cn(
          "-ml-2 mb-0 mr-5 p-0 sm:pe-8",
          item.isRefined && "font-bold",
        )}
        style={{ paddingInlineEnd: "0px" }}
        {...props}
      >
        <span>{item.value}</span>
      </Button>
      <div className="flex items-center">
        <div className="z-10 flex h-3 w-3 shrink-0 items-center justify-center rounded-full bg-blue-200 ring-0 ring-background dark:bg-blue-900 dark:ring-background sm:ring-8">
          <button onClick={props.onClick}>
            <svg
              className="h-2.5 w-2.5"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              {/* <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" /> */}
            </svg>
          </button>
        </div>
        <div className="hidden h-0.5 w-full bg-gray-200 dark:bg-gray-700 sm:flex"></div>
      </div>
    </li>
  );
}

export function TimelineOriginal() {
  return (
    <ol className="items-center sm:flex">
      <li className="relative mb-6 sm:mb-0">
        <div className="flex items-center">
          <div className="z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 ring-0 ring-white dark:bg-blue-900 dark:ring-gray-900 sm:ring-8">
            <svg
              className="h-2.5 w-2.5 text-blue-800 dark:text-blue-300"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
            </svg>
          </div>
          <div className="hidden h-0.5 w-full bg-gray-200 dark:bg-gray-700 sm:flex"></div>
        </div>
        <div className="mt-3 sm:pe-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Flowbite Library v1.0.0
          </h3>
          <time className="mb-2 block text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
            Released on December 2, 2021
          </time>
          <p className="text-base font-normal text-gray-500 dark:text-gray-400">
            Get started with dozens of web components and interactive elements.
          </p>
        </div>
      </li>
      <li className="relative mb-6 sm:mb-0">
        <div className="flex items-center">
          <div className="z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 ring-0 ring-white dark:bg-blue-900 dark:ring-gray-900 sm:ring-8">
            <svg
              className="h-2.5 w-2.5 text-blue-800 dark:text-blue-300"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
            </svg>
          </div>
          <div className="hidden h-0.5 w-full bg-gray-200 dark:bg-gray-700 sm:flex"></div>
        </div>
        <div className="mt-3 sm:pe-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Flowbite Library v1.2.0
          </h3>
          <time className="mb-2 block text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
            Released on December 23, 2021
          </time>
          <p className="text-base font-normal text-gray-500 dark:text-gray-400">
            Get started with dozens of web components and interactive elements.
          </p>
        </div>
      </li>
      <li className="relative mb-6 sm:mb-0">
        <div className="flex items-center">
          <div className="z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100 ring-0 ring-white dark:bg-blue-900 dark:ring-gray-900 sm:ring-8">
            <svg
              className="h-2.5 w-2.5 text-blue-800 dark:text-blue-300"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path d="M20 4a2 2 0 0 0-2-2h-2V1a1 1 0 0 0-2 0v1h-3V1a1 1 0 0 0-2 0v1H6V1a1 1 0 0 0-2 0v1H2a2 2 0 0 0-2 2v2h20V4ZM0 18a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V8H0v10Zm5-8h10a1 1 0 0 1 0 2H5a1 1 0 0 1 0-2Z" />
            </svg>
          </div>
          <div className="hidden h-0.5 w-full bg-gray-200 dark:bg-gray-700 sm:flex"></div>
        </div>
        <div className="mt-3 sm:pe-8">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            Flowbite Library v1.3.0
          </h3>
          <time className="mb-2 block text-sm font-normal leading-none text-gray-400 dark:text-gray-500">
            Released on January 5, 2022
          </time>
          <p className="text-base font-normal text-gray-500 dark:text-gray-400">
            Get started with dozens of web components and interactive elements.
          </p>
        </div>
      </li>
    </ol>
  );
}
