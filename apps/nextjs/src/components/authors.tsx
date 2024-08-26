"use client";

import React, { useEffect, useMemo } from "react";

import { cn } from "@acme/ui";
import { CardDescription } from "@acme/ui/card";

import type { FullCreditedPeopleType } from "~/app/articles";

export function useAuthors(credited_people?: FullCreditedPeopleType[]) {
  const authors = useMemo(() => {
    return credited_people?.map(
      (credited_person) => credited_person.credited_people.name,
    );
  }, [credited_people]);

  return authors;
}

export function Authors({
  authors,
  className,
  ...props
}: {
  authors?: string[];
} & React.HTMLAttributes<HTMLParagraphElement>) {
  useEffect(() => {
    console.log("authors", authors);
  }, [authors]);

  /* <DotIcon /> */
  return (
    <>
      {authors && authors.length !== 0 ? (
        <CardDescription
          className={cn("flex items-center justify-start", className)}
          {...props}
        >
          {authors.map((author, index) => (
            <span className="flex items-center text-foreground" key={index}>
              {author}
              {index !== authors.length - 1 && ",\u00A0"}
            </span>
          ))}
        </CardDescription>
      ) : undefined}
    </>
  );
}
