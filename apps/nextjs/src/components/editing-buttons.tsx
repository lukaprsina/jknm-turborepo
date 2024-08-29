"use client";

import { useContext } from "react";
import { useRouter } from "next/navigation";
import { PencilIcon, PlusIcon } from "lucide-react";

import type { Session } from "@acme/auth";
import type { Article } from "@acme/db/schema";
import type { ButtonProps } from "@acme/ui/button";
import { Button } from "@acme/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@acme/ui/tooltip";

import { EditableContext } from "~/components/editable-context";
import { content_to_text } from "~/lib/content-to-text";
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
          content_preview={content_to_text(article.content ?? undefined)}
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
  content_preview,
  has_draft,
  variant = "ghost",
}: {
  id: number;
  url: string;
  preview_image?: string;
  content_preview?: string;
  has_draft?: boolean;
  variant?: ButtonProps["variant"];
}) {
  const router = useRouter();
  const trpc_utils = api.useUtils();

  const article_create_draft = api.article.create_draft.useMutation({
    onSuccess: async (data) => {
      const returned_data = data?.at(0);
      if (!returned_data) return;

      await create_algolia_article({
        objectID: returned_data.id.toString(),
        title: returned_data.title,
        url: returned_data.url,
        content_preview: content_preview ?? "",
        created_at: returned_data.created_at.getTime(),
        published: !!returned_data.published,
        has_draft: !!returned_data.draft_content,
        year: returned_data.created_at.getFullYear().toString(),
        author_ids: returned_data.author_ids ?? undefined,
      });

      await trpc_utils.article.invalidate();

      // console.log("/uredi", generate_encoded_url(returned_data));
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
            console.log({ has_draft });
            if (has_draft) {
              router.push(
                `/uredi/${generate_encoded_url({
                  id,
                  url,
                })}`,
              );
            } else {
              article_create_draft.mutate({
                id,
              });
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
