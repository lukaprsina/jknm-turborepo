"use client";

import type { Hit as SearchHit } from "instantsearch.js";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useTheme } from "next-themes";

import type { Article, ArticleContentType } from "@acme/db/schema";
import type { ArticleHit } from "@acme/validators";
import { cn } from "@acme/ui";
import { AspectRatio } from "@acme/ui/aspect-ratio";
import { Badge } from "@acme/ui/badge";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@acme/ui/card";
import { MagicCard } from "@acme/ui/magic-card";

import { generate_encoded_url } from "~/lib/generate-encoded-url";
import { EditorToText } from "./editor-to-react";

export function ArticleDrizzleCard({
  article,
  featured,
}: {
  article: typeof Article.$inferSelect;
  featured?: boolean;
}) {
  return (
    <ArticleCard
      featured={featured}
      title={article.title}
      url={generate_encoded_url({ id: article.id, url: article.url })}
      published={!article.draft_content}
      preview_image={
        article.draft_preview_image ?? article.preview_image ?? undefined
      }
      content={article.draft_content ?? article.content ?? undefined}
      created_at={article.created_at}
    />
  );
  /* return featured ? (
    <FeaturedArticleCard
      title={article.title}
      url={generate_encoded_url({ id: article.id, url: article.url })}
      published={!article.draft_content}
      preview_image={
        article.draft_preview_image ?? article.preview_image ?? undefined
      }
      content={article.draft_content ?? article.content ?? undefined}
    />
  ) : (
    <ArticleCard
      title={article.title}
      url={generate_encoded_url({ id: article.id, url: article.url })}
      published={!article.draft_content}
      preview_image={
        article.draft_preview_image ?? article.preview_image ?? undefined
      }
      content={article.draft_content ?? article.content ?? undefined}
      created_at={article.created_at}
    />
  ); */
}

export function ArticleAlgoliaCard({ hit }: { hit: SearchHit<ArticleHit> }) {
  return (
    <ArticleCard
      title={hit.title}
      url={generate_encoded_url({ id: parseInt(hit.objectID), url: hit.url })}
      published
      preview_image={hit.image ?? undefined}
      content={hit.content ?? undefined}
      created_at={new Date(hit.created_at)}
    />
  );
}

export function ArticleCard({
  featured,
  title,
  url,
  published,
  preview_image,
  content,
  created_at,
}: {
  featured?: boolean;
  title: string;
  url: string;
  published: boolean;
  preview_image?: string;
  content?: ArticleContentType;
  created_at: Date;
}) {
  const theme = useTheme();
  const [hover, setHover] = useState(false);

  return (
    <Link
      href={`/novica/${url}`}
      className={cn(
        "overflow-hidden rounded-md bg-card no-underline shadow-lg",
        featured && "col-span-1 md:col-span-2 lg:col-span-3",
      )}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <MagicCard
        className="flex h-full flex-col"
        innerClassName="h-full"
        gradientColor={theme.resolvedTheme === "dark" ? "#262626" : "#D9D9D955"}
      >
        {preview_image ? (
          <AspectRatio
            ratio={16 / 9}
            className={cn(
              "relative rounded-md transition-transform",
              hover ? "scale-[1.01]" : null,
            )}
          >
            <Image
              src={preview_image}
              alt={title}
              fill
              className="rounded-md object-cover"
            />
            {!published && (
              <DraftBadge className="absolute bottom-0 right-0 mx-4 my-6" />
            )}
          </AspectRatio>
        ) : null}
        {/* TODO: če sta dve vrstici, ni poravnano */}
        <div className="h-full">
          <CardHeader>
            <h3 className="line-clamp-2 h-16">{title}</h3>
            <div className="flex w-full justify-between">
              <CardDescription>{created_at.toDateString()}</CardDescription>
              {!preview_image && !published && <DraftBadge />}
            </div>
          </CardHeader>
          <CardContent className="">
            <div className="h-full">
              <p
                className={cn(
                  "relative line-clamp-2 items-end",
                  !preview_image && "line-clamp-4",
                )}
              >
                <EditorToText content={content} />
              </p>
            </div>
          </CardContent>
        </div>
      </MagicCard>
    </Link>
  );
}

function DraftBadge({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  const theme = useTheme();

  return (
    <Badge
      className={cn(
        "shadow-sm",
        theme.resolvedTheme === "dark" ? "shadow-black" : "shadow-white",
        className,
      )}
      {...props}
    >
      Osnutek
    </Badge>
  );
}
