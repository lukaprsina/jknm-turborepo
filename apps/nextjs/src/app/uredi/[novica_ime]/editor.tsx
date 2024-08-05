/* eslint-disable @typescript-eslint/no-unsafe-call */
"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react";
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
import { Badge } from "@acme/ui/badge";
import { Button } from "@acme/ui/button";
import { useToast } from "@acme/ui/use-toast";

import { api } from "~/trpc/react";
import {
  article_title_to_url,
  edjsParser,
  get_heading_from_editor,
} from "./editor-utils";
import { EDITOR_JS_PLUGINS } from "./plugins";
import { SettingsDialog } from "./settings-button";
import { settings_store } from "./settings-store";
import { UploadDialog } from "./upload-dialog";

export default function MyEditor({
  article,
}: {
  article?: typeof Article.$inferSelect;
}) {
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);
  const editorJS = useRef<EditorJS | null>(null);
  const [dirty, setDirty] = useState(false);

  const content = useMemo(
    () => article?.draft_content ?? DEFAULT_VALUE,
    [article],
  );

  // api: API, event: BlockMutationEvent | BlockMutationEvent[]
  const onChange = useCallback(() => {
    setDirty(true);
  }, []);

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
      onChange: (_, event) => {
        if (Array.isArray(event)) {
          for (const _ of event) {
            onChange();
          }
        } else {
          onChange();
        }
      },
    });

    return temp_editor;
  }, [content, onChange]);

  useEffect(() => {
    if (editorJS.current != null) return;

    const temp_editor = editor_factory();
    editorJS.current = temp_editor;
  }, [editor_factory]);

  return (
    <div className="mx-auto w-full outline outline-1">
      <MyToolbar
        article={article}
        editor={editorJS.current ?? undefined}
        dirty={dirty}
        setDirty={setDirty}
      />
      <div
        id="editorjs"
        className="prose lg:prose-xl dark:prose-invert mx-auto"
      />
    </div>
  );
}

function MyToolbar({
  editor,
  article,
  dirty,
  setDirty,
}: {
  editor?: EditorJS;
  article?: typeof Article.$inferSelect;
  dirty: boolean;
  setDirty: (value: boolean) => void;
}) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const article_update = api.article.save.useMutation({
    onSuccess: (_, variables) => {
      settings_store.set.title(variables.title);
      settings_store.set.url(variables.url);
      settings_store.set.preview_image(variables.preview_image ?? null);
      setSaving(false);
      setDirty(false);

      if (variables.url !== article?.url)
        router.replace(`/uredi/${variables.url}`);
    },
  });

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  });

  const save_callback = useCallback(async () => {
    if (!editor || !article) return;
    setSaving(true);
    const editor_content = await editor.save();

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

    const content = await editor.save();
    const html = edjsParser.parse(content);

    article_update.mutate({
      id: article.id,
      title,
      url: article_title_to_url(title),
      draft_content: editor_content,
      draft_content_html: html.join("\n"),
      preview_image: settings_store.get.preview_image(),
      updated_at: new Date(),
    });
  }, [article, article_update, editor, toast]);

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "s" && event.ctrlKey) {
        event.preventDefault();
        void save_callback();
      }
    },
    [save_callback],
  );

  if (!editor || !article) return null;

  return (
    <div className="flex w-full items-center justify-between p-4">
      <div>
        {dirty ? (
          <Badge className="cursor-pointer" variant="outline">
            Ni shranjeno
          </Badge>
        ) : null}
      </div>
      <div className="flex">
        <div className="not-prose flex gap-1 text-sm">
          <p hidden={!saving} className="h-full pt-3">
            Saving...
          </p>
          <Button variant="ghost" size="icon" onClick={save_callback}>
            <SaveIcon />
          </Button>
        </div>
        <UploadDialog editor={editor} article={article} />
        <SettingsDialog editor={editor} article={article} />
        <ClearButton editor={editor} />
      </div>
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

const DEFAULT_VALUE = {
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
