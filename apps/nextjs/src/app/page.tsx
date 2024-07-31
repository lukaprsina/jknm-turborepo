import { api } from "~/trpc/server";
import { ArticleCard, FeaturedArticleCard } from "../components/article-card";
import { Shell } from "../components/shell";

export default async function HomePage() {
  const articles = await api.article.all();

  const rest = articles.slice(1);

  if (articles.length === 0 || !articles[0]) {
    return (
      <Shell>
        <div className="container grid grid-cols-1 gap-6 px-4 py-8 md:grid-cols-2 md:px-6 lg:grid-cols-3 lg:px-8">
          <h1>No Articles Found</h1>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <div className="container grid grid-cols-1 gap-6 px-4 py-8 md:grid-cols-2 md:px-6 lg:grid-cols-3 lg:px-8">
        <FeaturedArticleCard title={articles[0].title} url={articles[0].url} />
        {rest.map((article, index) => (
          <ArticleCard key={index} title={article.title} url={article.url} />
        ))}
      </div>
    </Shell>
  );
}
