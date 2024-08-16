"use client";

import { SaveIcon, XIcon } from "lucide-react";

import "./editor.css";

import { useCallback, useEffect } from "react";

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
import { Tooltip, TooltipContent, TooltipTrigger } from "@acme/ui/tooltip";

import { EditorProvider, useEditor } from "~/components/editor-context";
import { SettingsDialog } from "./settings-dialog";
import { settings_store } from "./settings-store";
import { UploadDialog } from "./upload-dialog";

export default function MyEditor({
  article,
}: {
  article?: typeof Article.$inferSelect;
}) {
  return (
    <EditorProvider article={article}>
      <div className="mx-auto w-full outline outline-1">
        <MyToolbar />
        <div
          id="editorjs"
          /* lg:prose-xl  */
          className="prose dark:prose-invert container"
        />
      </div>
      <SettingsSummary />
    </EditorProvider>
  );
}

function SettingsSummary() {
  const data = settings_store.useStore();
  return (
    <pre className="my-8 h-full overflow-auto">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

export interface SaveCallbackProps {
  variables?: Partial<typeof Article.$inferInsert>;
  update?: Partial<{ draft: boolean; content: boolean }> | false;
  redirect_to?: string | false;
}

export type SaveCallbackType = (props: SaveCallbackProps) => Promise<void>;

function MyToolbar() {
  const editor = useEditor();

  useEffect(() => {
    console.log("editor dirty:", editor?.dirty);
  }, [editor?.dirty]);

  if (!editor) return null;
  return (
    <div className="flex w-full items-baseline justify-between p-4">
      <div>{editor.savingText}</div>
      <div className="flex">
        <SaveButton />
        <UploadDialog />
        <SettingsDialog />
        <ClearButton />
      </div>
    </div>
  );
}

function SaveButton() {
  const editor = useEditor();

  const save_callback = useCallback(async () => {
    if (!editor?.article?.id) {
      console.error("Article ID is missing.");
      return;
    }

    const editor_content = await editor.editor?.save();

    editor.mutations.save_draft({
      id: editor.article.id,
      draft_content: editor_content,
      draft_preview_image: settings_store.get.preview_image() ?? "",
    });
  }, [editor]);

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (!editor?.article?.id) return;

      if (event.key !== "s" || !event.ctrlKey) return;

      event.preventDefault();

      void save_callback();
    },
    [editor?.article?.id, save_callback],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  });

  if (!editor) return null;

  return (
    <div className="not-prose flex gap-1 text-sm">
      {typeof editor.savingText === "undefined" ? (
        <p className="h-full pt-3">{editor.savingText}</p>
      ) : null}
      <Tooltip>
        <TooltipTrigger asChild>
          <Button variant="ghost" size="icon" onClick={() => save_callback()}>
            <SaveIcon />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>Shrani</p>
        </TooltipContent>
      </Tooltip>
    </div>
  );
}

function ClearButton() {
  const editor = useEditor();

  if (!editor) return null;

  return (
    <AlertDialog>
      <Tooltip>
        <TooltipTrigger asChild>
          <AlertDialogTrigger asChild>
            <Button variant="ghost" size="icon">
              <XIcon />
            </Button>
          </AlertDialogTrigger>
        </TooltipTrigger>
        <TooltipContent>
          <p>Ponastavi osnutek</p>
        </TooltipContent>
      </Tooltip>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Ponastavi osnutek</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription>
          Ste prepričani, da želite ponastaviti osnutek na objavljeno različico
          novičke?
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogAction
            onClick={async () => {
              const content = editor.article?.content;
              if (!content) {
                throw new Error("Article content is missing.");
              }

              await editor.editor?.render(content);
              settings_store.set.preview_image(
                // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
                editor.article?.preview_image || "",
              );
            }}
          >
            Ponastavi osnutek
          </AlertDialogAction>
          <AlertDialogCancel>Prekliči</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
