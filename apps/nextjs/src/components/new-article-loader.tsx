"use client";

import { useRouter } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";

import type { ButtonProps } from "@acme/ui/button";
import { cn } from "@acme/ui";
import { Button } from "@acme/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@acme/ui/card";

import { generate_encoded_url } from "~/lib/generate-encoded-url";
import { create_algolia_article } from "~/server/algolia";
import { api } from "~/trpc/react";

export default function NewArticleLoader({
  title,
  url,
  ...props
}: ButtonProps & { title?: string; url?: string }) {
  const router = useRouter();
  const article_create = api.article.create_article.useMutation({
    onSuccess: async (data) => {
      const returned_data = data.at(0);
      if (!returned_data) return;

      console.log("new article loader", returned_data);
      await create_algolia_article({
        objectID: returned_data.id.toString(),
        title: returned_data.title,
        url: returned_data.url,
        content: returned_data.content ?? undefined,
        created_at: returned_data.created_at,
        published: !!returned_data.published,
        year: returned_data.created_at.getFullYear().toString(),
      });

      router.push(`/uredi/${generate_encoded_url(returned_data)}`);
    },
  });

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          {...props}
          onClick={() => {
            const article_title = title ?? "Nova novica";
            const article_url = url ?? `nova-novica`;

            const template = {
              blocks: [
                {
                  id: "sheNwCUP5A",
                  type: "header",
                  data: {
                    text: article_title,
                    level: 1,
                  },
                },
              ],
            };

            article_create.mutate({
              title: article_title,
              url: article_url,
              preview_image: "",
              draft_content: template,
              updated_at: new Date(),
            });
          }}
        />
      </PopoverTrigger>
      <PopoverContent className="w-80">
        <Card>
          <CardHeader>
            <CardTitle>Ustvarjamo novo novico.</CardTitle>
          </CardHeader>
          <CardContent className="flex justify-between gap-4">
            <LoadingSpinner /> Prosimo, da malo počakate.
          </CardContent>
        </Card>
      </PopoverContent>
    </Popover>
  );
}

function LoadingSpinner({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("animate-spin", className)}
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}
