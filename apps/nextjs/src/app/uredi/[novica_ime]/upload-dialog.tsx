"use client";

import type EditorJS from "@editorjs/editorjs";
import { useRouter } from "next/navigation";
import { ArrowUpToLineIcon } from "lucide-react";

import type { Article } from "@acme/db/schema";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@acme/ui/alert-dialog";
import { Button } from "@acme/ui/button";

import { api } from "~/trpc/react";
import { edjsParser } from "./editor-utils";
import { settings_store } from "./settings-store";

export function UploadDialog({
  editor,
  article,
}: {
  editor: EditorJS;
  article: typeof Article.$inferInsert;
}) {
  const router = useRouter();
  const article_update = api.article.save.useMutation({
    onSuccess: (_, variables) => {
      settings_store.set.title(variables.title);
      settings_store.set.url(variables.url);
      settings_store.set.preview_image(variables.preview_image ?? null);
      /* setSaving(false);
      setDirty(false); */

      if (variables.url !== article.url)
        router.replace(`/uredi/${variables.url}`);
    },
  });

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button
          onClick={async () => {
            const content = await editor.save();
            const html = edjsParser.parse(content).join("\n");

            article_update.mutate({
              id: article.id,
              published: true,
              title: settings_store.get.title(),
              url: settings_store.get.url(),
              preview_image: settings_store.get.preview_image(),
              draft_content: content,
              draft_content_html: html,
              content: content,
              content_html: html,
              updated_at: new Date(),
            });
          }}
          size="icon"
          variant="ghost"
        >
          <ArrowUpToLineIcon />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete your
            account and remove your data from our servers.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction>Continue</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
