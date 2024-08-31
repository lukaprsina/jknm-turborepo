"use client";

import type { Hit as SearchHit } from "instantsearch.js";
import type { IntersectionObserverHookRefCallback } from "react-intersection-observer-hook";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { DotIcon } from "lucide-react";
import { useTheme } from "next-themes";

import type { Article } from "@acme/db/schema";
import type { ArticleHit } from "@acme/validators";
import { cn } from "@acme/ui";
import { AspectRatio } from "@acme/ui/aspect-ratio";
import { Badge } from "@acme/ui/badge";
import { CardContent, CardDescription, CardHeader } from "@acme/ui/card";
import { MagicCard } from "@acme/ui/magic-card";

import { Authors } from "~/components/authors";
import { content_to_text } from "~/lib/content-to-text";
import { format_date } from "~/lib/format-date";
import { generate_encoded_url } from "~/lib/generate-encoded-url";

// React.RefObject<HTMLAnchorElement>;
export const ArticleDrizzleCard = ({
  article,
  featured,
  ref,
}: {
  article: typeof Article.$inferSelect;
  featured?: boolean;
  ref?: IntersectionObserverHookRefCallback;
}) => {
  return (
    <ArticleCard
      featured={featured}
      ref={ref}
      title={article.title}
      url={generate_encoded_url({ id: article.id, url: article.url })}
      published={!article.draft_content}
      preview_image={
        article.draft_preview_image ?? article.preview_image ?? undefined
      }
      content_preview={content_to_text(
        article.draft_content ?? article.content ?? undefined,
      )}
      created_at={article.created_at}
      author_ids={article.author_ids ?? undefined}
    />
  );
};

export function ArticleAlgoliaCard({ hit }: { hit: SearchHit<ArticleHit> }) {
  return (
    <ArticleCard
      title={hit.title}
      url={generate_encoded_url({ id: parseInt(hit.objectID), url: hit.url })}
      published
      preview_image={hit.image ?? undefined}
      content_preview={hit.content_preview}
      created_at={new Date(hit.created_at)}
      author_ids={hit.author_ids}
    />
  );
}

export function ArticleCard({
  featured,
  title,
  url,
  published,
  preview_image,
  content_preview,
  created_at,
  author_ids,
  ref,
}: {
  featured?: boolean;
  title: string;
  url: string;
  published: boolean;
  preview_image?: string;
  content_preview?: string;
  created_at?: Date;
  author_ids?: string[];
  ref?: IntersectionObserverHookRefCallback;
}) {
  const theme = useTheme();
  const [hover, setHover] = useState(false);

  return (
    <Link
      href={`/novica/${url}`}
      // rounded-md bg-card
      className={cn(
        "overflow-hidden rounded-xl bg-transparent no-underline shadow-lg",
        featured && "col-span-1 md:col-span-2 lg:col-span-3",
      )}
      ref={ref}
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
              priority={featured}
              className="rounded-md object-cover"
              loader={({ src }) => src}
            />
            {!published && (
              <DraftBadge className="absolute bottom-0 right-0 mx-4 my-6" />
            )}
          </AspectRatio>
        ) : null}
        <div className="prose-h3:font-semibold prose-h3:text-xl h-full">
          <CardHeader>
            {/* TODO, hardcodani dve vrstici */}
            <h3 className="line-clamp-2 h-[56px]">{title}</h3>
            <div className="flex w-full justify-between gap-2">
              <CardDescription
                className={cn(
                  "flex w-full items-center gap-3 text-foreground",
                  author_ids ? "justify-between" : "justify-end",
                  featured &&
                    author_ids &&
                    created_at &&
                    "justify-normal gap-0",
                )}
              >
                <span
                  // flex items-center
                  // line-clamp-1 flex-grow-0 flex-nowrap overflow-hidden text-ellipsis text-nowrap
                  // className="flex flex-nowrap items-center justify-start overflow-x-scroll"
                  className="relative line-clamp-1 flex flex-grow-0 flex-nowrap items-center justify-start text-ellipsis text-nowrap"
                >
                  <Authors author_ids={author_ids ?? []} />
                </span>
                {featured && author_ids && created_at && <DotIcon size={20} />}
                {created_at && (
                  <span className="flex flex-nowrap text-nowrap">
                    {format_date(created_at)}
                  </span>
                )}
              </CardDescription>
              {!preview_image && !published && <DraftBadge />}
            </div>
          </CardHeader>
          <CardContent className="">
            <div className="h-full">
              <p
                className={cn(
                  "relative line-clamp-3 items-end",
                  !preview_image && "line-clamp-4",
                )}
              >
                {content_preview}
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
