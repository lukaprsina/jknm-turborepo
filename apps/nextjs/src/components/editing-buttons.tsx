"use client";

import { useContext } from "react";
import Link from "next/link";
import { Pencil1Icon, PlusIcon } from "@radix-ui/react-icons";

import { Session } from "@acme/auth";
import { Button } from "@acme/ui/button";

import { settings_store } from "~/app/uredi/[novica_ime]/settings-plugins/settings-store";
import { EditableContext } from "~/components/editable-context";
import NewArticleLoader from "./new-article-loader";

export default function EditingButtons({ session }: { session?: Session }) {
  const editable = useContext(EditableContext);

  return (
    <>
      {session?.user ? (
        <>
          {editable ? (
            <Button
              className="dark:bg-primary/80 dark:text-primary-foreground"
              variant="ghost"
              size="icon"
              asChild
            >
              <Link href={`/uredi/${settings_store.get.url()}`}>
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
