/* eslint-disable @typescript-eslint/no-unsafe-call */
"use client";

import { useCallback, useEffect, useMemo, useReducer, useRef } from "react";
import { useRouter } from "next/navigation";
import EditorJS from "@editorjs/editorjs";
// @ts-expect-error no types
import DragDrop from "editorjs-drag-drop";
// @ts-expect-error no types
import Undo from "editorjs-undo";
import { SaveIcon, XIcon } from "lucide-react";

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
import { useToast } from "@acme/ui/use-toast";

import { api } from "~/trpc/react";
import { article_title_to_url, get_heading_from_editor } from "./editor-utils";
import { EDITOR_JS_PLUGINS } from "./plugins";
import { SettingsDialog } from "./settings-button";
import { settings_store } from "./settings-store";

export default function MyEditor({
  article,
}: {
  article?: typeof Article.$inferSelect;
}) {
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);
  const editorJS = useRef<EditorJS | null>(null);

  const content = useMemo(
    () => article?.draftContent ?? default_value,
    [article],
  );

  const editor_factory = useCallback(() => {
    const temp_editor = new EditorJS({
      holder: "editorjs",
      tools: EDITOR_JS_PLUGINS,
      data: content,
      autofocus: true,
      onReady: () => {
        setTimeout(() => {
          new Undo({ editor: editorJS.current });
          new DragDrop(editorJS.current);
        }, 500);

        setTimeout(() => {
          forceUpdate();
        }, 1000);
      },
    });

    return temp_editor;
  }, [content]);

  useEffect(() => {
    if (editorJS.current != null) return;

    const temp_editor = editor_factory();
    editorJS.current = temp_editor;
  }, [editor_factory]);

  return (
    <div className="prose lg:prose-xl dark:prose-invert mx-auto w-full outline outline-1">
      <MyToolbar article={article} editor={editorJS.current ?? undefined} />
      <div id="editorjs" />
    </div>
  );
}

function MyToolbar({
  editor,
  article,
}: {
  editor?: EditorJS;
  article?: typeof Article.$inferSelect;
}) {
  if (!editor || !article) return null;

  return (
    <div className="flex w-full justify-end space-x-4 p-4">
      <SaveButton editor={editor} article={article} />
      <SettingsDialog editor={editor} article={article} />
      <ClearButton editor={editor} />
    </div>
  );
}

function SaveButton({
  editor,
  article,
}: {
  editor: EditorJS;
  article: typeof Article.$inferSelect;
}) {
  const { toast } = useToast();
  const router = useRouter();
  const article_update = api.article.save.useMutation({
    onSuccess: (_, variables) => {
      settings_store.set.title(variables.title);
      settings_store.set.url(variables.url);
      settings_store.set.preview_image(variables.previewImage ?? null);

      if (variables.url !== article.url)
        router.replace(`/uredi/${variables.url}`);
    },
  });

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={async () => {
        const editor_content = await editor.save();
        settings_store.set.editor_content(editor_content);

        const { title, error } = get_heading_from_editor(editor_content);

        if (error === "NO_HEADING") {
          toast({
            title: "Naslov ni nastavljen",
            description: "Prva vrstica mora biti H1 naslov.",
            action: (
              <Button
                onClick={() => {
                  editor.blocks.insert(
                    "header",
                    { text: "Neimenovana novica", level: 1 },
                    undefined,
                    0,
                    true,
                    false,
                  );
                }}
              >
                Dodaj naslov
              </Button>
            ),
          });
        } else if (error === "WRONG_HEADING_LEVEL") {
          toast({
            title: "Naslov ni pravilne ravni",
            description: "Prva vrstica mora biti H1 naslov.",
            action: (
              <Button
                onClick={() => {
                  editor.blocks.insert(
                    "header",
                    { text: title ?? "Neimenovana novica", level: 1 },
                    undefined,
                    0,
                    true,
                    true,
                  );
                }}
              >
                Popravi naslov
              </Button>
            ),
          });
        }

        if (!title) return;

        settings_store.set.title(title);
        settings_store.set.url(article_title_to_url(title));

        article_update.mutate({
          id: article.id,
          title,
          url: article_title_to_url(title),
          draftContent: editor_content,
          previewImage: settings_store.get.preview_image(),
          updatedAt: new Date(),
        });
      }}
    >
      <SaveIcon />
    </Button>
  );
}

function ClearButton({ editor }: { editor?: EditorJS }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="ghost" size="icon">
          <XIcon />
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Izbriši vsebino</AlertDialogTitle>
        </AlertDialogHeader>
        <AlertDialogDescription>
          Ste prepričani, da želite izbrisati vsebino?
        </AlertDialogDescription>
        <AlertDialogFooter>
          <AlertDialogAction onClick={() => editor?.clear()}>
            Izbriši vse
          </AlertDialogAction>
          <AlertDialogCancel>Prekliči</AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

const default_value = {
  time: 1635603431943,
  blocks: [
    {
      id: "sheNwCUP5A",
      type: "header",
      data: {
        text: "Editor.js",
        level: 1,
      },
    },
  ],
};
