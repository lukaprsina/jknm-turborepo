"use client";

import type { Hit as SearchHit } from "instantsearch.js";
import type { UseSearchBoxProps, UseSortByProps } from "react-instantsearch";
import Image from "next/image";
import Link from "next/link";
import { useSearchBox, useSortBy, useStats } from "react-instantsearch";

import type { ArticleHit } from "@acme/validators";
// import { InstantSearchNext } from "react-instantsearch-nextjs";

import { AspectRatio } from "@acme/ui/aspect-ratio";
import { Button } from "@acme/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@acme/ui/card";
import { Input } from "@acme/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@acme/ui/select";

import { EditorToReact } from "~/components/editor-to-react";

export function MySortBy(props: UseSortByProps) {
  const { currentRefinement, options, refine } = useSortBy(props);

  return (
    <Select onValueChange={(value) => refine(value)} value={currentRefinement}>
      <SelectTrigger className="">
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

export function ArticleHit({ hit }: { hit: SearchHit<ArticleHit> }) {
  return (
    <Link
      href={`/novica/${hit.url}-${hit.objectID}`}
      className="overflow-hidden rounded-md bg-card no-underline shadow-lg transition-transform hover:scale-[1.01]"
    >
      <Card className="h-full">
        {hit.image && (
          <AspectRatio ratio={16 / 9} className="rounded-md">
            <Image
              src={hit.image}
              alt={hit.title}
              fill
              className="rounded-md object-cover"
            />
          </AspectRatio>
        )}
        {/* TODO: če sta dve vrstici, ni poravnano */}
        <div className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-blue-800">{hit.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="line-clamp-2 h-full overflow-y-hidden">
              <EditorToReact just_text content={hit.content ?? undefined} />
            </div>
          </CardContent>
        </div>
      </Card>
    </Link>
  );
}

export function MyStats() {
  const stats = useStats();

  return (
    <span>
      {stats.processingTimeMS} ms, {stats.nbHits} novic
    </span>
  );
}

export function Timeline({ children }: { children: React.ReactNode }) {
  return <ol className="items-center pb-8 sm:flex">{children}</ol>;
}

export function TimelineItem({ year }: { year: number }) {
  return (
    <li className="relative mb-6 pl-2 sm:mb-0">
      <Button
        variant="link"
        className="-ml-2 mb-0 mr-5 p-0 sm:pe-8"
        style={{ paddingInlineEnd: "0px" }}
        onClick={() => {
          /*  */
        }}
      >
        <span>{year}</span>
      </Button>
      <div className="flex items-center">
        <div className="z-10 flex h-3 w-3 shrink-0 items-center justify-center rounded-full bg-blue-200 ring-0 ring-background dark:bg-blue-900 dark:ring-background sm:ring-8">
          <button>
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
