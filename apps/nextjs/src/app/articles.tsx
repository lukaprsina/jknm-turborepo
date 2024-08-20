import type { IntersectionObserverHookRefCallback } from "react-intersection-observer-hook";
import React, { useCallback } from "react";
import { cva } from "class-variance-authority";

import type {
  Article,
  ArticlesToCreditedPeople,
  CreditedPeople,
} from "@acme/db/schema";
import { cn } from "@acme/ui";
import { Card, CardDescription, CardHeader, CardTitle } from "@acme/ui/card";

import { ArticleDrizzleCard } from "~/components/article-card";

export const articles_variants = cva(
  "prose dark:prose-invert prose-img:m-0 prose-h3:my-0 prose-h3:py-0 prose-p:m-0",
);

type ArticleType = typeof Article.$inferSelect;
type ArticlesToCreditedPeopleType =
  typeof ArticlesToCreditedPeople.$inferSelect;
type PartialCreditedPeopleType = typeof CreditedPeople.$inferSelect;

type FullCreditedPeopleType = ArticlesToCreditedPeopleType & {
  credited_people: PartialCreditedPeopleType;
};

export type ArticleWithCreditedPeople = ArticleType & {
  credited_people: FullCreditedPeopleType[];
};

export const Articles = ({
  articles,
  featured,
  ref,
}: {
  articles?: ArticleWithCreditedPeople[];
  featured?: boolean;
  ref?: IntersectionObserverHookRefCallback;
}) => {
  const offset = 9;
  // articles[0]?.credited_people[0]?.credited_people.name

  const load_more_ref = useCallback(
    (index: number) => {
      if (!articles) return;

      const test = articles.length - 1 - offset;
      return index === Math.max(test, 0) ? ref : undefined;
    },
    [articles, ref],
  );

  return (
    <>
      {articles && articles.length !== 0 ? (
        /* prose-h3:my-0 prose-p:mt-0 lg:prose-xl prose-p:text-lg mx-auto   */
        <div
          className={cn(
            articles_variants(),
            "container grid w-full grid-cols-1 gap-6 px-4 py-8 md:grid-cols-2 md:px-6 lg:grid-cols-3 lg:px-8",
          )}
        >
          {articles.map((article, index) => (
            <ArticleDrizzleCard
              key={article.id}
              featured={index === 0 && featured}
              article={article}
              ref={load_more_ref(index)}
            />
          ))}
        </div>
      ) : (
        <div className="container mb-4 mt-8 flex h-full min-h-screen w-full items-center justify-center">
          <Card>
            <CardHeader>
              <CardTitle>Ni mogoče naložiti novičk.</CardTitle>
              <CardDescription>Preverite internetno povezavo.</CardDescription>
            </CardHeader>
          </Card>
        </div>
      )}
    </>
  );
};
