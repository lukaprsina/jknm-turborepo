import { HydrateClient } from "~/trpc/server";
import { ArticleCard } from "./_components/article-card";

export default function HomePage() {
  return (
    <HydrateClient>
      <main className="container h-screen py-16">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {Array.from({ length: 20 }, (_, index) => (
            <ArticleCard key={index} />
          ))}
        </div>
      </main>
    </HydrateClient>
  );
}
