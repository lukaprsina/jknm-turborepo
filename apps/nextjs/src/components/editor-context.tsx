"use client";

import type { OutputData } from "@editorjs/editorjs";
import type { ReactNode } from "react";
import React, {
  createContext,
  useCallback,
  useContext,
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
import _ from "lodash";

import type { Article } from "@acme/db/schema";
import { Button } from "@acme/ui/button";
import { toast } from "@acme/ui/use-toast";

import { editor_store } from "~/app/uredi/[novica_ime]/editor-store";
import {
  get_clean_url,
  get_file_data_from_editor,
  get_heading_from_editor,
  get_image_data_from_editor,
} from "~/app/uredi/[novica_ime]/editor-utils";
import { content_to_text } from "~/lib/content-to-text";
import { generate_encoded_url } from "~/lib/generate-encoded-url";
import {
  delete_algolia_article,
  update_algolia_article,
} from "~/server/algolia";
import {
  clean_s3_directory,
  delete_s3_directory,
  rename_s3_directory,
} from "~/server/image-s3";
import { api } from "~/trpc/react";
import { EDITOR_JS_PLUGINS } from "./plugins";

export interface EditorContextType {
  editor?: EditorJS;
  article?: typeof Article.$inferSelect;
  configure_article_before_publish: () => Promise<OutputData | undefined>;
  update_settings_from_editor: (
    editor_content: OutputData,
    title?: string,
    url?: string,
  ) => void;
  savingText: string | undefined;
  setSavingText: (value: string | undefined) => void;
  dirty: boolean;
  setDirty: (value: boolean) => void;
  mutations: {
    save_draft: ReturnType<typeof api.article.save_draft.useMutation>["mutate"];
    delete_draft: ReturnType<
      typeof api.article.delete_draft.useMutation
    >["mutate"];
    publish: ReturnType<typeof api.article.publish.useMutation>["mutate"];
    unpublish: ReturnType<typeof api.article.unpublish.useMutation>["mutate"];
    delete_by_id: ReturnType<typeof api.article.delete.useMutation>["mutate"];
  };
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const useEditor = () => {
  return useContext(EditorContext);
};

interface EditorProviderProps {
  children: ReactNode;
  article?: typeof Article.$inferSelect;
}

export const EditorProvider: React.FC<EditorProviderProps> = ({
  children,
  article,
}: EditorProviderProps) => {
  const router = useRouter();
  const [savingText, setSavingText] = useState<string | undefined>();
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);
  const editorJS = useRef<EditorJS | null>(null);
  const [dirty, setDirty] = useState(false);
  const trpc_utils = api.useUtils();

  const content = useMemo(
    () => article?.draft_content ?? DEFAULT_VALUE,
    [article],
  );

  const update_settings_from_editor = useCallback(
    (editor_content: OutputData, title?: string, url?: string) => {
      if (!editorJS.current || !article) return;

      const image_data = get_image_data_from_editor(editor_content);
      editor_store.set.image_data(image_data);

      const preview_image = editor_store.get.preview_image();

      if (!preview_image) {
        if (article.draft_preview_image) {
          editor_store.set.preview_image(article.draft_preview_image);
        } else if (article.preview_image) {
          editor_store.set.preview_image(article.preview_image);
        } else {
          editor_store.set.preview_image(image_data.at(0)?.file.url);
        }
      }

      editor_store.set.id(article.id);

      if (typeof title !== "undefined") editor_store.set.title(title);
      if (typeof url !== "undefined") editor_store.set.url(url);
    },
    [article],
  );

  const editor_factory = useCallback(() => {
    // api: API, event: BlockMutationEvent | BlockMutationEvent[]
    const onChange = () => {
      setDirty(true);
    };

    const temp_editor = new EditorJS({
      holder: "editorjs",
      tools: EDITOR_JS_PLUGINS(),
      data: content,
      // inlineToolbar: ["italic", "strong", "underline"], //true, //["link", "marker", "bold", "italic"],
      autofocus: true,
      onReady: () => {
        setTimeout(() => {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
          new Undo({ editor: editorJS.current });
          // eslint-disable-next-line @typescript-eslint/no-unsafe-call
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

        async function update_article() {
          const editor_content = await editorJS.current?.save();
          if (!editor_content || !article) return;
          editor_store.set.preview_image(undefined);

          update_settings_from_editor(
            editor_content,
            article.title,
            article.url,
          );
        }

        void update_article();
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
  }, [content, article, update_settings_from_editor]);

  const save_draft = api.article.save_draft.useMutation({
    onMutate: () => {
      if (!article?.id) {
        console.error("Article ID is missing.");
        return;
      }

      setSavingText("Shranjujem osnutek ...");
    },
    onSuccess: async () => {
      if (!editorJS.current || !article) return;
      const editor_content = await editorJS.current.save();

      update_settings_from_editor(editor_content);

      setSavingText(undefined);
    },
  });

  const delete_draft = api.article.delete_draft.useMutation({
    onMutate: () => {
      if (!article?.id) {
        console.error("Article ID is missing.");
        return;
      }

      setSavingText("Brišem osnutek ...");
    },
    onSuccess: (data) => {
      const returned_data = data?.at(0);
      if (!editorJS.current || !returned_data || !article) return;

      setSavingText(undefined);

      router.push(
        `/novica/${generate_encoded_url({
          id: returned_data.id,
          url: returned_data.url,
        })}`,
      );
    },
  });

  const publish = api.article.publish.useMutation({
    onMutate: () => {
      if (!article?.id) {
        console.error("Article ID is missing.");
        return;
      }

      setSavingText("Objavljam spremembe ...");
    },
    onSuccess: async (data) => {
      const returned_data = data.at(0);
      if (!editorJS.current || !returned_data || !article) return;
      console.warn("published", returned_data);

      const content_preview = content_to_text(
        returned_data.content ?? undefined,
      );

      if (!content_preview) {
        console.error("No content preview", returned_data);
      }

      await update_algolia_article({
        objectID: returned_data.id.toString(),
        title: returned_data.title,
        url: returned_data.url,
        created_at: returned_data.created_at.getTime(),
        year: returned_data.created_at.getFullYear().toString(),
        content_preview,
        published: true,
        has_draft: !!returned_data.draft_content,
        image: returned_data.preview_image ?? undefined,
      });

      setSavingText(undefined);

      const old_article_url = `${get_clean_url(article.url)}-${article.id}`;
      const new_article_url = `${get_clean_url(returned_data.url)}-${returned_data.id}`;

      console.log("Renaming S3 directory", {
        old_article_url,
        new_article_url,
        article,
        returned_data,
      });

      if (old_article_url !== new_article_url) {
        await rename_s3_directory(old_article_url, new_article_url);
      }

      const editor_content = await editorJS.current.save();
      const image_data = get_image_data_from_editor(editor_content);
      const file_data = get_file_data_from_editor(editor_content);
      const urls_to_keep = image_data.map((image) => image.file.url);
      urls_to_keep.push(...file_data.map((file) => file.file.url));

      if (returned_data.preview_image)
        urls_to_keep.push(returned_data.preview_image);

      if (returned_data.draft_preview_image)
        urls_to_keep.push(returned_data.draft_preview_image);

      const spliced_urls = urls_to_keep.map((image_url) => {
        // get the last part of the url
        const parts = image_url.split("/");
        const filename = parts.slice(-1).join("/");
        return decodeURIComponent(filename);
      });

      console.log("Cleaning S3 directory", {
        new_article_url,
        spliced_urls,
      });

      await clean_s3_directory(new_article_url, spliced_urls);

      router.replace(`/novica/${generate_encoded_url(returned_data)}`);
    },
  });

  const unpublish = api.article.unpublish.useMutation({
    onMutate: () => {
      setSavingText("Skrivam novičko ...");
    },
    onSuccess: async (data) => {
      const returned_data = data?.at(0);
      if (!returned_data) return;

      setSavingText(undefined);

      await update_algolia_article({
        objectID: returned_data.id.toString(),
        published: false,
        has_draft: true,
      });
    },
  });

  const delete_by_id = api.article.delete.useMutation({
    onMutate: () => {
      setSavingText("Brišem novičko ...");
    },
    onSuccess: async (data) => {
      const returned_data = data.at(0);
      if (!returned_data) return;

      await delete_algolia_article(returned_data.id.toString());
      await delete_s3_directory(`${returned_data.url}-${returned_data.id}`);
      await trpc_utils.article.invalidate();

      router.replace(`/`);
    },
  });

  useEffect(() => {
    if (editorJS.current != null) return;

    const temp_editor = editor_factory();
    editorJS.current = temp_editor;
  }, [editor_factory]);

  const configure_article_before_publish = async () => {
    if (!editorJS.current || !article) return;

    let editor_content = await editorJS.current.save();

    const { title: new_title, error } = get_heading_from_editor(editor_content);

    if (error === "NO_HEADING") {
      toast({
        title: "Naslov ni nastavljen",
        description: "Prva vrstica mora biti H1 naslov.",
        action: <NoHeadingButton editor={editorJS.current} />,
      });
    } else if (error === "WRONG_HEADING_LEVEL") {
      toast({
        title: "Naslov ni pravilne ravni",
        description: "Prva vrstica mora biti H1 naslov.",
        action: (
          <WrongHeadingButton editor={editorJS.current} title={new_title} />
        ),
      });
    }

    if (!new_title) return;
    const new_url = get_clean_url(new_title);

    const new_article_url = `${new_url}-${article.id}`;

    editor_content = await editorJS.current.save();
    rename_files_in_editor(editor_content, new_article_url);

    update_settings_from_editor(editor_content, new_title, new_url);

    const preview_image = editor_store.get.preview_image();

    const new_preview_image = preview_image
      ? rename_file(preview_image, new_article_url)
      : undefined;

    editor_store.set.preview_image(new_preview_image);

    return editor_content;
  };

  return (
    <EditorContext.Provider
      value={{
        article,
        editor: editorJS.current ?? undefined,
        dirty,
        savingText,
        setSavingText,
        setDirty,
        configure_article_before_publish,
        update_settings_from_editor,
        mutations: {
          save_draft: save_draft.mutate,
          delete_draft: delete_draft.mutate,
          publish: publish.mutate,
          unpublish: unpublish.mutate,
          delete_by_id: delete_by_id.mutate,
        },
      }}
    >
      {children}
    </EditorContext.Provider>
  );
};

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

function rename_files_in_editor(editor_content: OutputData, new_dir: string) {
  console.log("Renaming files in editor", { editor_content, new_dir });

  for (const block of editor_content.blocks) {
    if (!block.id || !["image", "attaches"].includes(block.type)) {
      console.log("Skipping block", block.type);
      continue;
    }

    const file_data = block.data as { file: { url: string } };
    const new_url = rename_file(file_data.file.url, new_dir);
    console.log("Renamed file", { old_url: file_data.file.url, new_url });
    file_data.file.url = new_url;
  }
}

function rename_file(old_url: string, new_dir: string) {
  const url_parts = new URL(old_url);
  const file_name = url_parts.pathname.split("/").pop();
  if (!file_name) {
    console.error("No name in URL", old_url);
    return old_url;
  }

  const new_url = `${url_parts.protocol}//${url_parts.hostname}/${new_dir}/${file_name}`;
  return new_url;
}

const DEFAULT_VALUE = {
  time: 1635603431943,
  blocks: [
    {
      id: "sheNwCUP5A",
      type: "header",
      data: {
        text: "Napaka: ne najdem vsebine",
        level: 1,
      },
    },
  ],
};
