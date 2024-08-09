"use client";

import Image from "next/image";
import Link from "next/link";

import type { Article } from "@acme/db/schema";
import { AspectRatio } from "@acme/ui/aspect-ratio";
import { Card, CardContent, CardHeader, CardTitle } from "@acme/ui/card";

import { EditorToReact } from "./editor-to-react";

export function FeaturedArticleCard({
  article,
}: {
  article: typeof Article.$inferSelect;
}) {
  return (
    <Link
      href={`/novica/${article.url}-${article.id}`}
      className="col-span-1 overflow-hidden rounded-md no-underline shadow-lg transition-transform hover:scale-[1.01] md:col-span-2 lg:col-span-3"
    >
      <Card className="h-full">
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
        <div>
          <CardHeader>
            <CardTitle className="text-blue-800">{article.title}</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="line-clamp-2 h-full overflow-y-hidden">
              <EditorToReact just_text content={article.content ?? undefined} />
            </div>
          </CardContent>
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
      href={`/novica/${article.url}-${article.id}`}
      className="overflow-hidden rounded-md bg-card no-underline shadow-lg transition-transform hover:scale-[1.01]"
    >
      <Card className="h-full">
        {article.preview_image && (
          <AspectRatio ratio={16 / 9} className="rounded-md">
            <Image
              src={article.preview_image}
              alt={article.title}
              fill
              className="rounded-md object-cover"
            />
          </AspectRatio>
        )}
        <div>
          <CardHeader>
            <CardTitle className="text-blue-800">{article.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="line-clamp-2 h-full overflow-y-hidden">
              <EditorToReact just_text content={article.content ?? undefined} />
            </div>
          </CardContent>
        </div>
      </Card>
    </Link>
  );
}
