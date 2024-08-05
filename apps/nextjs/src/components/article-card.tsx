import Image from "next/image";
import Link from "next/link";

import type { Article } from "@acme/db/schema";
import { AspectRatio } from "@acme/ui/aspect-ratio";
import { Card, CardContent, CardHeader, CardTitle } from "@acme/ui/card";

export function FeaturedArticleCard({
  article,
}: {
  article: typeof Article.$inferSelect;
}) {
  console.log(article.title, article.content_html);
  return (
    <Link
      href={`/novica/${article.url}`}
      className="col-span-1 overflow-hidden rounded-lg shadow-lg transition-transform hover:scale-[1.01] md:col-span-2 lg:col-span-3"
    >
      <Card>
        {article.preview_image && (
          <AspectRatio ratio={16 / 9} className="rounded-md">
            <Image
              src={article.preview_image}
              alt="Photo by Drew Beamer"
              fill
              className="rounded-md object-cover"
            />
          </AspectRatio>
        )}
        <div className="p-4 md:p-6">
          <CardHeader>
            <CardTitle>{article.title}</CardTitle>
          </CardHeader>
          {article.content_html ? (
            <CardContent className="prose lg:prose-xl dark:prose-invert line-clamp-2 overflow-y-hidden">
              <div
                dangerouslySetInnerHTML={{
                  __html: article.content_html
                    .split("\n")
                    .filter((tag) => tag.includes("<p>"))
                    .join("\n"),
                }}
              />
            </CardContent>
          ) : null}
        </div>
      </Card>
    </Link>
  );
}

export function ArticleCard({
  article,
}: {
  article: typeof Article.$inferSelect;
}) {
  return (
    <Link
      href={`/novica/${article.url}`}
      className="overflow-hidden rounded-lg bg-card shadow-lg transition-transform hover:scale-[1.01]"
    >
      <Card>
        {article.preview_image && (
          <AspectRatio ratio={16 / 9} className="rounded-md">
            <Image
              src={article.preview_image}
              alt="Photo by Drew Beamer"
              fill
              className="rounded-md object-cover"
            />
          </AspectRatio>
        )}
        <div className="lg:p12 p-6 md:p-8">
          <CardHeader>
            <CardTitle>{article.title}</CardTitle>
          </CardHeader>
          {article.content_html ? (
            <CardContent className="prose lg:prose-xl dark:prose-invert line-clamp-1 overflow-y-hidden">
              <div
                dangerouslySetInnerHTML={{
                  __html: article.content_html
                    .split("\n")
                    .filter((tag) => tag.includes("<p>"))
                    .join("\n"),
                }}
              />
            </CardContent>
          ) : null}
        </div>
      </Card>
    </Link>
  );
}
