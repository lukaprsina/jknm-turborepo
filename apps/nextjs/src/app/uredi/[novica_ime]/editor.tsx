"use client";

import { useCallback, useEffect, useReducer, useRef } from "react";
import EditorJS from "@editorjs/editorjs";
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
import { ToastAction } from "@acme/ui/toast";
import { useToast } from "@acme/ui/use-toast";

import { EDITOR_JS_PLUGINS } from "./plugins";

export default function MyEditor({
  article,
}: {
  article?: typeof Article.$inferSelect;
}) {
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);
  const editorJS = useRef<EditorJS | null>(null);

  const content = article?.content ?? default_value;

  const editor_factory = useCallback(() => {
    const temp_editor = new EditorJS({
      holder: "editorjs",
      tools: EDITOR_JS_PLUGINS,
      data: content,
      autofocus: true,
      onReady: () => {
        forceUpdate();
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
      <MyToolbar editor={editorJS.current ?? undefined} />
      <div id="editorjs" />
    </div>
  );
}

function MyToolbar({ editor }: { editor?: EditorJS }) {
  const { toast } = useToast();
  if (!editor) return null;

  return (
    <div className="flex w-full justify-end space-x-4 p-4">
      <Button
        variant="ghost"
        size="icon"
        onClick={async () => {
          const editor_content = await editor.save();
          // editor_content.blocks
          toast({
            title: "Naslov ni nastavljen",
            description: "Prva vrstica mora biti H1 naslov.",
            action: (
              <ToastAction altText="Dodaj naslov">Dodaj naslov</ToastAction>
            ),
          });
        }}
      >
        <SaveIcon />
      </Button>
      <ClearButton editor={editor} />
    </div>
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
