"use client";

import { useContext } from "react";
import { useRouter } from "next/navigation";
import { PencilIcon, PlusIcon } from "lucide-react";

import type { Session } from "@acme/auth";
import type { Article, ArticleContentType } from "@acme/db/schema";
import type { ButtonProps } from "@acme/ui/button";
import { Button } from "@acme/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@acme/ui/tooltip";

import { EditableContext } from "~/components/editable-context";
import { generate_encoded_url } from "~/lib/generate-encoded-url";
import { create_algolia_article } from "~/server/algolia";
import { api } from "~/trpc/react";
import NewArticleLoader from "./new-article-loader";

export default function EditingButtons({
  session,
  article,
}: {
  session?: Session;
  article?: typeof Article.$inferSelect;
}) {
  const editable = useContext(EditableContext);

  if (!session?.user) return null;

  return (
    <>
      {article && editable == "readonly" ? (
        <EditButton
          id={article.id}
          url={article.url}
          preview_image={article.preview_image ?? undefined}
          content={article.content ?? undefined}
          has_draft={!!article.draft_content}
        />
      ) : null}
      <NewArticleLoader
        className="dark:bg-primary/80 dark:text-primary-foreground"
        variant="ghost"
        size="icon"
        children={<PlusIcon size={24} />}
      />
    </>
  );
}

export function EditButton({
  id,
  url,
  preview_image,
  content,
  has_draft,
  variant = "ghost",
}: {
  id: number;
  url: string;
  preview_image?: string;
  content?: ArticleContentType;
  has_draft?: boolean;
  variant?: ButtonProps["variant"];
}) {
  const router = useRouter();
  const trpc_utils = api.useUtils();

  const article_create_draft = api.article.create_draft.useMutation({
    onSuccess: async (data) => {
      const returned_data = data?.at(0);
      if (!returned_data) return;

      console.log("editing buttons", returned_data);
      await create_algolia_article({
        objectID: returned_data.id.toString(),
        title: returned_data.title,
        url: returned_data.url,
        content: returned_data.content ?? undefined,
        created_at: returned_data.created_at,
        published: !!returned_data.published,
        has_draft: !!returned_data.draft_content,
        year: returned_data.created_at.getFullYear().toString(),
      });

      await trpc_utils.article.invalidate();

      router.push(`/uredi/${generate_encoded_url(returned_data)}`);
    },
  });

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          className="dark:bg-primary/80 dark:text-primary-foreground"
          variant={variant}
          size="icon"
          onClick={() => {
            if (has_draft) {
              article_create_draft.mutate({
                id,
                preview_image: preview_image ?? "",
                content: content ?? undefined,
              });
            } else {
              router.push(
                `/uredi/${generate_encoded_url({
                  id,
                  url,
                })}`,
              );
            }
          }}
        >
          <PencilIcon size={20} />
        </Button>
      </TooltipTrigger>
      <TooltipContent>Uredi</TooltipContent>
    </Tooltip>
  );
}
