import { auth } from "@acme/auth";
import { Card, CardDescription, CardHeader, CardTitle } from "@acme/ui/card";

import { api } from "~/trpc/server";
import { ArticleCard, FeaturedArticleCard } from "../components/article-card";
import { Shell } from "../components/shell";

export default async function HomePage() {
  const session = await auth();

  const articles = session
    ? await api.article.allProtected()
    : await api.article.all();

  const rest = articles.slice(1);

  return (
    <Shell>
      {articles.length !== 0 && articles[0] ? (
        <div className="container grid grid-cols-1 gap-6 px-4 py-8 md:grid-cols-2 md:px-6 lg:grid-cols-3 lg:px-8">
          <FeaturedArticleCard
            title={articles[0].title}
            url={articles[0].url}
          />
          {rest.map((article, index) => (
            <ArticleCard key={index} title={article.title} url={article.url} />
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
    </Shell>
  );
}
