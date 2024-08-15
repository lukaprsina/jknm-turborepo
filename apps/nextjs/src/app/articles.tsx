import type { Article } from "@acme/db/schema";
import { Card, CardDescription, CardHeader, CardTitle } from "@acme/ui/card";

import { ArticleDrizzleCard } from "~/components/article-card";

export function Articles({
  articles,
  featured,
}: {
  articles?: (typeof Article.$inferSelect)[];
  featured?: boolean;
}) {
  const rest = featured ? articles?.slice(1) : articles;

  return (
    <>
      {articles && articles.length !== 0 && articles[0] ? (
        /* prose-h3:my-0 prose-p:mt-0 lg:prose-xl prose-p:text-lg  */
        <div className="prose dark:prose-invert prose-img:m-0 prose-p:m-0 container mx-auto grid w-full grid-cols-1 gap-6 px-4 py-8 md:grid-cols-2 md:px-6 lg:grid-cols-3 lg:px-8">
          {featured && <ArticleDrizzleCard featured article={articles[0]} />}
          {rest?.map((article, index) => (
            <ArticleDrizzleCard key={index} article={article} />
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
}
