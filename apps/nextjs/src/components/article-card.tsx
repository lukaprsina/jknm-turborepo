"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";

import type { Article } from "@acme/db/schema";
import { cn } from "@acme/ui";
import { AspectRatio } from "@acme/ui/aspect-ratio";
import { Badge } from "@acme/ui/badge";
import { CardContent, CardHeader, CardTitle } from "@acme/ui/card";
import { MagicCard } from "@acme/ui/magic-card";

import { generate_encoded_url } from "~/lib/generate-encoded-url";
import { EditorToReact } from "./editor-to-react";

export function FeaturedArticleCard({
  article,
}: {
  article: typeof Article.$inferSelect;
}) {
  const theme = useTheme();
  const [hover, setHover] = useState(false);

  return (
    <Link
      href={`/novica/${generate_encoded_url(article)}`}
      className="col-span-1 overflow-hidden rounded-md no-underline shadow-lg md:col-span-2 lg:col-span-3"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <MagicCard
        className="flex h-full w-full flex-col"
        gradientColor={theme.resolvedTheme === "dark" ? "#262626" : "#D9D9D955"}
      >
        {article.draft_preview_image || article.preview_image ? (
          <AspectRatio
            ratio={16 / 9}
            className={cn(
              "relative h-full w-full rounded-md transition-transform",
              hover ? "scale-[1.01]" : null,
            )}
          >
            <Image
              // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
              src={article.draft_preview_image || article.preview_image || ""}
              alt="Photo by Drew Beamer"
              fill
              className="rounded-md object-cover"
            />
            {!article.published && (
              <Badge
                className={cn(
                  "absolute bottom-0 right-0 m-4 shadow-sm",
                  theme.resolvedTheme === "dark"
                    ? "shadow-black"
                    : "shadow-white",
                )}
              >
                Osnutek
              </Badge>
            )}
          </AspectRatio>
        ) : null}
        <div>
          <CardHeader>
            <CardTitle className="text-blue-800">{article.title}</CardTitle>
          </CardHeader>

          <CardContent>
            <div className="line-clamp-2 h-full overflow-y-hidden">
              <EditorToReact
                just_text
                content={
                  // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                  article.draft_content || article.content || undefined
                }
              />
            </div>
          </CardContent>
        </div>
      </MagicCard>
    </Link>
  );
}

export function ArticleCard({
  article,
}: {
  article: typeof Article.$inferSelect;
}) {
  const theme = useTheme();
  const [hover, setHover] = useState(false);

  return (
    <Link
      href={`/novica/${generate_encoded_url(article)}`}
      className="overflow-hidden rounded-md bg-card no-underline shadow-lg"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <MagicCard
        className="flex h-full w-full flex-col"
        gradientColor={theme.resolvedTheme === "dark" ? "#262626" : "#D9D9D955"}
      >
        {article.draft_preview_image || article.preview_image ? (
          <AspectRatio
            ratio={16 / 9}
            className={cn(
              "relative h-full w-full rounded-md transition-transform",
              hover ? "scale-[1.01]" : null,
            )}
          >
            <Image
              // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
              src={article.draft_preview_image || article.preview_image || ""}
              alt={article.title}
              fill
              className="rounded-md object-cover"
            />
            {!article.published && (
              <Badge
                className={cn(
                  "absolute bottom-0 right-0 m-4 shadow-sm",
                  theme.resolvedTheme === "dark"
                    ? "shadow-black"
                    : "shadow-white",
                )}
              >
                Osnutek
              </Badge>
            )}
          </AspectRatio>
        ) : null}
        {/* TODO: če sta dve vrstici, ni poravnano */}
        <div className="flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-blue-800">{article.title}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="line-clamp-2 h-full overflow-y-hidden">
              <EditorToReact just_text content={article.content ?? undefined} />
            </div>
          </CardContent>
        </div>
      </MagicCard>
    </Link>
  );
}
