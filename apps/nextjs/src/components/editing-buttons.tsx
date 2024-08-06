"use client";

import { useContext } from "react";
import Link from "next/link";
import { PencilIcon, PlusIcon } from "lucide-react";

import type { Session } from "@acme/auth";
import type { Article } from "@acme/db/schema";
import { Button } from "@acme/ui/button";

import { EditableContext } from "~/components/editable-context";
import NewArticleLoader from "./new-article-loader";

export default function EditingButtons({
  session,
  article: article,
}: {
  session?: Session;
  article?: typeof Article.$inferSelect;
}) {
  const editable = useContext(EditableContext);

  if (!session?.user) return null;

  return (
    <>
      {editable == "readonly" ? (
        <Button
          className="dark:bg-primary/80 dark:text-primary-foreground"
          variant="ghost"
          size="icon"
          asChild
        >
          {article ? (
            <Link href={`/uredi/${article.url}-${article.id}`}>
              <PencilIcon size={20} />
            </Link>
          ) : null}
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
