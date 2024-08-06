import type { Article } from "@acme/db/schema";
import { Card, CardDescription, CardHeader, CardTitle } from "@acme/ui/card";

import { ArticleCard, FeaturedArticleCard } from "~/components/article-card";

export function Articles({
  articles,
}: {
  articles: (typeof Article.$inferSelect)[];
}) {
  const rest = articles.slice(1);

  return (
    <>
      {articles.length !== 0 && articles[0] ? (
        <div className="prose lg:prose-xl dark:prose-invert prose-img:m-0 container grid max-w-none grid-cols-1 gap-6 px-4 py-8 md:grid-cols-2 md:px-6 lg:grid-cols-3 lg:px-8">
          <FeaturedArticleCard article={articles[0]} />
          {rest.map((article, index) => (
            <ArticleCard key={index} article={article} />
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
