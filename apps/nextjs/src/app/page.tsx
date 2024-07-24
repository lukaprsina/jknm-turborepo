import { ArticleCard, FeaturedArticleCard } from "./_components/article-card";
import { Shell } from "./_components/shell";

export default function HomePage() {
  return (
    <Shell>
      <div className="container mx-auto grid grid-cols-1 gap-6 px-4 py-8 md:grid-cols-2 md:px-6 lg:grid-cols-3 lg:px-8">
        <FeaturedArticleCard />
        {Array.from({ length: 20 }, (_, index) => (
          <ArticleCard key={index} />
        ))}
      </div>
    </Shell>
  );
}
