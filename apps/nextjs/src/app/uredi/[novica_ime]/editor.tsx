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
import { Button } from "@acme/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@acme/ui/tooltip";
import { useToast } from "@acme/ui/use-toast";

import { api } from "~/trpc/react";
import {
  article_title_to_url,
  edjsParser,
  get_heading_from_editor,
  get_image_data_from_editor,
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
      inlineToolbar: true, //["link", "marker", "bold", "italic"],
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
      <Button onClick={() => editorJS.current?.toolbar.toggleToolbox()}>
        Toggle
      </Button>
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

export interface SaveCallbackProps {
  variables?: Partial<typeof Article.$inferInsert>;
  update?: Partial<{ draft: boolean; content: boolean }> | false;
}

export type SaveCallbackType = (props: SaveCallbackProps) => Promise<void>;

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
    onSuccess: (data, variables) => {
      settings_store.set.title(variables.title);
      settings_store.set.url(variables.url);
      settings_store.set.preview_image(variables.preview_image ?? null);
      setDirty(false);

      if (!data?.[0]?.id) {
        console.log("No article ID returned", data);
        return;
      }

      if (variables.url !== article?.url)
        router.replace(`/uredi/${variables.url}-${data[0]?.id}`);
    },
    onError: (error) => {
      console.error("article_update error", error);
    },
    onSettled: () => {
      setSaving(false);
    },
  });

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  });

  const save_callback = useCallback(
    async ({ variables, update }: SaveCallbackProps) => {
      if (!editor || !article) return;

      if (update) setSaving(true);
      const editor_content = await editor.save();

      const image_data = get_image_data_from_editor(editor_content);
      console.log(image_data);
      settings_store.set.image_data(image_data);

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

      if (!update) return;

      const filtered_values = variables
        ? Object.fromEntries(
            Object.entries(variables).filter(
              ([, value]) => typeof value !== "undefined",
            ),
          )
        : undefined;

      article_update.mutate({
        id: article.id,
        title,
        url: article_title_to_url(title),
        draft_content: update.draft ? editor_content : article.draft_content,
        draft_content_html: update.draft
          ? html.join("\n")
          : article.draft_content_html,
        content: update.content ? editor_content : article.content,
        content_html: update.content ? html.join("\n") : article.content_html,
        preview_image: settings_store.get.preview_image(),
        updated_at: new Date(),
        ...filtered_values,
      });
    },
    [article, article_update, editor, toast],
  );

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (!editor || !article) return;

      if (event.key !== "s" || !event.ctrlKey) return;

      event.preventDefault();
      void save_callback({ update: { draft: true } });
    },
    [save_callback, article, editor],
  );

  if (!editor || !article) return null;

  return (
    <div className="flex w-full items-baseline justify-between p-4">
      <div>{dirty ? <p>Ni shranjeno</p> : null}</div>
      <div className="flex">
        <SaveButton saving={saving} save_callback={save_callback} />
        <UploadDialog save_callback={save_callback} />
        <SettingsDialog article={article} save_callback={save_callback} />
        <ClearButton article={article} save_callback={save_callback} />
      </div>
    </div>
  );
}

function SaveButton({
  saving,
  save_callback,
}: {
  saving: boolean;
  save_callback: SaveCallbackType;
}) {
  return (
    <div className="not-prose flex gap-1 text-sm">
      <p hidden={!saving} className="h-full pt-3">
        Shranujem...
      </p>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => save_callback({ update: { draft: true } })}
          >
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

function ClearButton({
  save_callback,
  article,
}: {
  save_callback: SaveCallbackType;
  article: typeof Article.$inferSelect;
}) {
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
            onClick={() =>
              save_callback({
                variables: {
                  draft_content: article.content,
                  draft_content_html: article.content_html,
                },
              })
            }
          >
            Ponastavi osnutek
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
