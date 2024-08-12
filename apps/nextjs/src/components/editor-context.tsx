"use client";

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
import EditorJS from "@editorjs/editorjs";
// @ts-expect-error no types
import DragDrop from "editorjs-drag-drop";
// @ts-expect-error no types
import Undo from "editorjs-undo";

import type { Article } from "@acme/db/schema";
import { Button } from "@acme/ui/button";
import { toast } from "@acme/ui/use-toast";

import {
  article_title_to_url,
  get_heading_from_editor,
  get_image_data_from_editor,
} from "~/app/uredi/[novica_ime]/editor-utils";
import { settings_store } from "~/app/uredi/[novica_ime]/settings-store";
import { EDITOR_JS_PLUGINS } from "./plugins";

export interface EditorContextType {
  editor?: EditorJS;
  article?: typeof Article.$inferSelect;
  configure_article_before_publish: () => Promise<
    | {
        old_article_url: string;
        new_article_url: string;
      }
    | undefined
  >;
  update_settings_from_editor: () => Promise<void>;
  savingText: string | undefined;
  setSavingText: (value: string | undefined) => void;
  dirty: boolean;
  setDirty: (value: boolean) => void;
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
  const [savingText, setSavingText] = useState<string | undefined>();
  const [, forceUpdate] = useReducer((x: number) => x + 1, 0);
  const editorJS = useRef<EditorJS | undefined>();
  const [dirty, setDirty] = useState(false);

  const content = useMemo(
    () => article?.draft_content ?? DEFAULT_VALUE,
    [article],
  );

  // api: API, event: BlockMutationEvent | BlockMutationEvent[]
  const onChange = useCallback(() => {
    setDirty(true);
  }, []);

  const update_settings_from_editor = useCallback(async () => {
    if (!editorJS.current || !article) return;

    const editor_content = await editorJS.current.save();
    const image_data = get_image_data_from_editor(editor_content);
    settings_store.set.image_data(image_data);

    const preview_image =
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      article.draft_preview_image ||
      // eslint-disable-next-line @typescript-eslint/prefer-nullish-coalescing
      article.preview_image ||
      image_data.at(0)?.url;

    settings_store.set.id(article.id);
    settings_store.set.title(article.title);
    settings_store.set.url(article.url);
    settings_store.set.preview_image(preview_image);

    console.log("preview image", {
      draft: article.draft_preview_image,
      published: article.preview_image,
      image_data_first: image_data[0]?.url,
    });
  }, [article]);

  const editor_factory = useCallback(() => {
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

        void update_settings_from_editor();
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
  }, [content, article, update_settings_from_editor, onChange]);

  useEffect(() => {
    if (editorJS.current != null) return;

    const temp_editor = editor_factory();
    editorJS.current = temp_editor;
  }, [editor_factory]);

  const configure_article_before_publish = async () => {
    if (!editorJS.current || !article) return;

    const editor_content = await editorJS.current.save();

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
    const new_url = article_title_to_url(new_title);

    const old_article_url = `${article.url}-${article.id}`;
    const new_article_url = `${new_url}-${article.id}`;

    await rename_images(editorJS.current, old_article_url, new_article_url);
    // editor_content = await editorJS.current.save();

    await update_settings_from_editor();

    return { old_article_url, new_article_url };
  };

  return (
    <EditorContext.Provider
      value={{
        article,
        editor: editorJS.current,
        dirty,
        savingText,
        setSavingText,
        setDirty,
        configure_article_before_publish,
        update_settings_from_editor,
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
