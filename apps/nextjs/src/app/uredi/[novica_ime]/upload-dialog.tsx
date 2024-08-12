"use client";

import { ArrowUpToLineIcon } from "lucide-react";

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
import { Tooltip, TooltipContent, TooltipTrigger } from "@acme/ui/tooltip";

import { useEditor } from "~/components/editor-context";
import { settings_store } from "./settings-store";

export function UploadDialog() {
  const editor = useEditor();

  if (!editor) return null;

  return (
    <AlertDialog>
      <Tooltip>
        <TooltipTrigger asChild>
          <AlertDialogTrigger asChild>
            <Button size="icon" variant="ghost">
              <ArrowUpToLineIcon />
            </Button>
          </AlertDialogTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Shrani in objavi</p>
        </TooltipContent>
      </Tooltip>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Shrani in objavi</AlertDialogTitle>
          <AlertDialogDescription>
            Ste prepričani, da želite objaviti novico?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Ne objavi</AlertDialogCancel>
          <AlertDialogAction
            onClick={async () => {
              if (!editor.article?.id) {
                console.error("Article ID is missing.");
                return;
              }

              editor.setSavingText("Objavljam spremembe ...");

              const editor_content = await editor.editor?.save();

              editor.mutations.publish({
                ...editor.article,
                content: editor_content,
                title: settings_store.get.title(),
                url: settings_store.get.url(),
                preview_image: settings_store.get.preview_image() ?? "",
              });
            }}
          >
            Objavi
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
