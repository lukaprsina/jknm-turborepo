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
import { SettingsDialog } from "./settings-button";
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
          className="prose lg:prose-xl dark:prose-invert mx-auto"
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
            onClick={() => {
              // TODO
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
