"use client";

import { useContext } from "react";
import { useRouter } from "next/navigation";
import { PencilIcon, PlusIcon } from "lucide-react";

import type { Session } from "@acme/auth";
import type { Article } from "@acme/db/schema";
import { Button } from "@acme/ui/button";

import { EditableContext } from "~/components/editable-context";
import { api } from "~/trpc/react";
import NewArticleLoader from "./new-article-loader";

export default function EditingButtons({
  session,
  article: article,
}: {
  session?: Session;
  article?: typeof Article.$inferSelect;
}) {
  const editable = useContext(EditableContext);
  const router = useRouter();
  // const create_algolia_article = api.algolia

  const article_create_draft = api.article.create_draft.useMutation({
    onSuccess: (data) => {
      const returned_data = data?.at(0);
      if (!returned_data) return;

      router.push(`/uredi/${returned_data.url}-${returned_data.id}`);
    },
  });

  if (!session?.user) return null;

  return (
    <>
      {article && editable == "readonly" ? (
        <Button
          className="dark:bg-primary/80 dark:text-primary-foreground"
          variant="ghost"
          size="icon"
          onClick={() => {
            article_create_draft.mutate({
              id: article.id,
            });
          }}
        >
          <PencilIcon size={20} />
        </Button>
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
