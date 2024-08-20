import React, { useMemo } from "react";
import { cva } from "class-variance-authority";

import type { Article } from "@acme/db/schema";
import { cn } from "@acme/ui";
import { Card, CardDescription, CardHeader, CardTitle } from "@acme/ui/card";

import { ArticleDrizzleCard } from "~/components/article-card";

export const articles_variants = cva(
  "prose dark:prose-invert prose-img:m-0 prose-h3:my-0 prose-h3:py-0 prose-p:m-0",
);

export const Articles = React.forwardRef<
  HTMLDivElement,
  {
    articles?: (typeof Article.$inferSelect)[];
    featured?: boolean;
  }
>(({ articles, featured }, ref) => {
  const all_articles = useMemo(() => {
    articles?.map((article, index) => {
      if (index === 0 && featured)
        return <ArticleDrizzleCard featured article={article} />;
      else if (index === articles.length - 1)
        return (
          <ArticleDrizzleCard key={article.id} article={article} ref={ref} />
        );
      else return <ArticleDrizzleCard key={article.id} article={article} />;
    });
  }, [articles, featured, ref]);

  return (
    <>
      {articles && articles.length !== 0 && articles[0] ? (
        /* prose-h3:my-0 prose-p:mt-0 lg:prose-xl prose-p:text-lg mx-auto   */
        <div
          className={cn(
            articles_variants(),
            "container grid w-full grid-cols-1 gap-6 px-4 py-8 md:grid-cols-2 md:px-6 lg:grid-cols-3 lg:px-8",
          )}
        >
          {all_articles}
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
});
