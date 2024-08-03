"use client";

import { useContext } from "react";
import Link from "next/link";
import { Pencil1Icon, PlusIcon } from "@radix-ui/react-icons";

import type { Session } from "@acme/auth";
import { Button } from "@acme/ui/button";

import { EditableContext } from "~/components/editable-context";
import NewArticleLoader from "./new-article-loader";

export default function EditingButtons({
  session,
  article_url,
}: {
  session?: Session;
  article_url?: string;
}) {
  const editable = useContext(EditableContext);

  return (
    <>
      {session?.user ? (
        <>
          {editable == "readonly" ? (
            <Button
              className="dark:bg-primary/80 dark:text-primary-foreground"
              variant="ghost"
              size="icon"
              asChild
            >
              <Link href={`/uredi/${article_url}`}>
                <Pencil1Icon />
              </Link>
            </Button>
          ) : null}
          <NewArticleLoader
            className="dark:bg-primary/80 dark:text-primary-foreground"
            variant="ghost"
            size="icon"
            children={<PlusIcon />}
          />
        </>
      ) : null}
    </>
  );
}
