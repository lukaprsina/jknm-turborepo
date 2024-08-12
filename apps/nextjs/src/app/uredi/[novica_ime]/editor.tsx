/* eslint-disable @typescript-eslint/prefer-nullish-coalescing */
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

import "./editor.css";

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
import { rename_s3_directory } from "./editor-server";
import {
  article_title_to_url,
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
  const editorJS = useRef<EditorJS | undefined>();
  const [dirty, setDirty] = useState(false);
  const toast = useToast();

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
      tools: EDITOR_JS_PLUGINS(toast),
      data: content,
      // inlineToolbar: ["italic", "strong", "underline"], //true, //["link", "marker", "bold", "italic"],
      autofocus: true,
      onReady: () => {
        setTimeout(() => {
          new Undo({ editor: editorJS.current });
          new DragDrop(editorJS.current);
        }, 500);

        setTimeout(() => {
          forceUpdate();
        }, 1000);

        if (!article) return;
        if (!editorJS.current) {
          console.error("No editorJS.current");
          return;
        }

        void editorJS.current.save().then((editor_content) => {
          const image_data = get_image_data_from_editor(editor_content);
          settings_store.set.image_data(image_data);

          settings_store.set.id(article.id);
          settings_store.set.title(article.title);
          settings_store.set.url(article.url);
          settings_store.set.preview_image(
            article.draft_preview_image ||
              article.preview_image ||
              image_data[0]?.url,
          );

          console.log("preview image", {
            draft: article.draft_preview_image,
            published: article.preview_image,
            image_data_first: image_data[0]?.url,
          });
        });
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
  }, [toast, content, article, onChange]);

  useEffect(() => {
    if (editorJS.current != null) return;

    const temp_editor = editor_factory();
    editorJS.current = temp_editor;
  }, [editor_factory]);

  return (
    <>
      <SettingsSummary />
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
    </>
  );
}

function SettingsSummary() {
  const data = settings_store.useStore();
  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}

export interface SaveCallbackProps {
  variables?: Partial<typeof Article.$inferInsert>;
  update?: Partial<{ draft: boolean; content: boolean }> | false;
  redirect_to?: string | false;
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

  /* const article_update = api.article.save.useMutation({
    onSuccess: (data, variables) => {
      const id = data?.at(0)?.id;
      if (!id) {
        console.log("No article ID returned", data);
        return;
      }

      if (!editor) {
        console.error("No editorJS.current");
        return;
      }

      void editor.save().then((editor_content) => {
        const image_data = get_image_data_from_editor(editor_content);
        settings_store.set.image_data(image_data);

        settings_store.set.id(id);
        settings_store.set.title(variables.title);
        settings_store.set.url(variables.url);
        settings_store.set.preview_image(
          variables.draft_preview_image ||
            variables.preview_image ||
            image_data[0]?.url,
        );

        console.log("preview image", {
          draft: variables.draft_preview_image,
          published: variables.preview_image,
          image_data_first: image_data[0]?.url,
        });
      });

      setDirty(false);
    },
    onError: (error) => {
      console.error("article_update error", error);
    },
    onSettled: () => {
      setSaving(false);
    },
  }); */

  useEffect(() => {
    document.addEventListener("keydown", handleKeyPress);

    return () => {
      document.removeEventListener("keydown", handleKeyPress);
    };
  });

  /* const save_callback = useCallback(
    async ({ variables, update, redirect_to = "uredi" }: SaveCallbackProps) => {
      if (!editor || !article) return;

      if (update) setSaving(true);
      let editor_content = await editor.save();

      const { title: new_title, error } =
        get_heading_from_editor(editor_content);

      if (error === "NO_HEADING") {
        toast({
          title: "Naslov ni nastavljen",
          description: "Prva vrstica mora biti H1 naslov.",
          action: <NoHeadingButton editor={editor} />,
        });
      } else if (error === "WRONG_HEADING_LEVEL") {
        toast({
          title: "Naslov ni pravilne ravni",
          description: "Prva vrstica mora biti H1 naslov.",
          action: <WrongHeadingButton editor={editor} title={new_title} />,
        });
      }

      if (!update) return;
      if (!new_title) return;
      const new_url = article_title_to_url(new_title);

      const old_article_url = `${article.url}-${article.id}`;
      const new_article_url = `${new_url}-${article.id}`;

      if (update.content) {
        await rename_images(editor, old_article_url, new_article_url);
        editor_content = await editor.save();
      }

      const filtered_values = variables
        ? Object.fromEntries(
            Object.entries(variables).filter(
              ([, value]) => typeof value !== "undefined",
            ),
          )
        : undefined;

      article_update.mutate(
        {
          id: article.id,
          title: update.content ? new_title : article.title,
          url: update.content ? new_url : article.url,
          content: update.content ? editor_content : article.content,
          draft_content: update.draft ? editor_content : article.draft_content,
          preview_image: update.content
            ? settings_store.get.preview_image()
            : article.preview_image,
          draft_preview_image: update.draft
            ? settings_store.get.preview_image()
            : article.draft_preview_image,
          updated_at: update.content ? new Date() : article.updated_at,
          ...filtered_values,
        },
        {
          onSuccess: (_, success_variables) => {
            const navigate_to_redirect = () => {
              if (redirect_to)
                router.replace(`/${redirect_to}/${new_article_url}`);
            };

            if (success_variables.url !== article.url) {
              void rename_s3_directory(old_article_url, new_article_url).then(
                navigate_to_redirect,
              );
            } else {
              navigate_to_redirect();
            }
          },
        },
      );
    },
    [editor, article, article_update, toast, router],
  ); */

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (!editor || !article) return;

      if (event.key !== "s" || !event.ctrlKey) return;

      event.preventDefault();
      // void save_callback({ update: { draft: true } });
    },
    [article, editor],
  );

  if (!editor || !article) return null;

  return (
    <div className="flex w-full items-baseline justify-between p-4">
      <div>{dirty ? <p>Ni shranjeno</p> : null}</div>
      <div className="flex">
        <SaveButton saving={saving} save_callback={save_callback} />
        <UploadDialog save_callback={save_callback} />
        <SettingsDialog article={article} save_callback={save_callback} />
        <ClearButton save_callback={save_callback} />
      </div>
    </div>
  );
}

function NoHeadingButton({ editor }: { editor: EditorJS }) {
  return (
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
  );
}

function WrongHeadingButton({
  editor,
  title,
}: {
  editor: EditorJS;
  title?: string;
}) {
  return (
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
  );
}

async function rename_images(
  editor: EditorJS,
  old_dir: string,
  new_dir: string,
) {
  const editor_content = await editor.save();

  for (const block of editor_content.blocks) {
    // TODO: files
    if (!block.id || block.type !== "image") continue;

    const image_data = block.data as { file: { url: string } };
    const new_url = image_data.file.url.replace(old_dir, new_dir);
    image_data.file.url = new_url;

    await editor.blocks.update(block.id, {
      data: image_data,
    });
  }
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

function ClearButton({ save_callback }: { save_callback: SaveCallbackType }) {
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
                update: { draft: true },
                redirect_to: "novica",
                variables: {
                  /* TODO: do I need to update title, url */
                  draft_content: null,
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
