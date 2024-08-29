"use client";

import { SaveIcon, XIcon } from "lucide-react";

import "./editor.css";

import type { ComponentType } from "react";
import { useCallback, useContext, useEffect, useMemo } from "react";
import Image from "next/image";

import type { Article } from "@acme/db/schema";
import { cn } from "@acme/ui";
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
import { MultiSelect } from "@acme/ui/multi-select";
import { Tooltip, TooltipContent, TooltipTrigger } from "@acme/ui/tooltip";

import type { GoogleAdminUser } from "~/app/api/get_users/google-admin";
import { EditorProvider, useEditor } from "~/components/editor-context";
import UsersContext from "~/components/users-context";
import { editor_store } from "./editor-store";
import { SettingsDialog } from "./settings-dialog";
import { UploadDialog } from "./upload-dialog";

export default function MyEditor({
  article,
  users,
}: {
  article?: typeof Article.$inferSelect;
  users?: GoogleAdminUser[];
}) {
  return (
    <UsersContext.Provider value={users}>
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
    </UsersContext.Provider>
  );
}

function SettingsSummary() {
  const data = editor_store.useStore();
  return (
    <pre className="my-8 h-full overflow-auto">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}

export interface SaveCallbackProps {
  variables?: Partial<typeof Article.$inferSelect>;
  update?: Partial<{ draft: boolean; content: boolean }> | false;
  redirect_to?: string | false;
}

export type SaveCallbackType = (props: SaveCallbackProps) => Promise<void>;

interface AuthorMultiSelectType {
  label: string;
  value: string;
  icon?: ComponentType<{ className?: string | undefined }>;
}

function MyToolbar() {
  const users_context = useContext(UsersContext);
  const editor = useEditor();

  const authors = useMemo(() => {
    if (!users_context) return [];

    const mapped_authors = users_context
      .filter((user) => {
        if (user.suspended) return false;
        return true;
      })
      .map((user) => ({
        label: user.name,
        value: user.id,
        icon: ({ className }: { className: string | undefined }) => {
          if (!user.thumbnail || !user.name) return;

          return (
            <Image
              src={user.thumbnail}
              alt={user.name}
              width={16}
              height={16}
              className={cn("rounded-full", className)}
            />
          );
        },
      }))
      .filter((mapped_user) => {
        return mapped_user.label && mapped_user.value;
      });

    return mapped_authors as AuthorMultiSelectType[];
  }, [users_context]);

  if (!editor) return null;
  return (
    <div className="flex flex-col justify-between gap-4">
      <div className="flex w-full items-center justify-between p-4">
        <div className="flex items-center gap-2">
          <MultiSelect
            onValueChange={(value) => {
              console.log("MultiSelect onValueChange", value);
            }}
            defaultValue={[]}
            options={authors}
            placeholder="Avtorji"
            // variant="inverted"
            animation={2}
            maxCount={3}
          />
          {editor.savingText}
        </div>
        <div className="flex items-center">
          <SaveButton />
          <UploadDialog />
          <SettingsDialog />
          <ClearButton />
        </div>
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
      draft_preview_image: editor_store.get.preview_image() ?? "",
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
        <TooltipContent>Shrani</TooltipContent>
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
        <TooltipContent>Ponastavi osnutek</TooltipContent>
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
            onClick={() => {
              if (!editor.article?.id) {
                console.error("Article ID is missing.");
                return;
              }

              editor.mutations.delete_draft({ id: editor.article.id });
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
