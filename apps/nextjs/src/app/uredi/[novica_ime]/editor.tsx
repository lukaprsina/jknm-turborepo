"use client";

import type { Value } from "@udecode/plate-common/server";
import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plate } from "@udecode/plate-common";
import { PlateEditor } from "@udecode/plate-common/server";
import { serializeHtml } from "@udecode/plate-serializer-html";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { Article } from "@acme/db/schema";

import { Editor } from "~/components/plate-ui/editor";
import { FixedToolbar } from "~/components/plate-ui/fixed-toolbar";
import { FixedToolbarButtons } from "~/components/plate-ui/fixed-toolbar-buttons";
import { FloatingToolbar } from "~/components/plate-ui/floating-toolbar";
import { FloatingToolbarButtons } from "~/components/plate-ui/floating-toolbar-buttons";
import { TooltipProvider } from "~/components/plate-ui/tooltip";
import { api } from "~/trpc/react";
import plugins from "./plugins";
import { save_store } from "./save-plugin/save-store";
import { settings_store } from "./settings-plugins/settings-store";

const INITIAL_VALUE = [
  {
    id: "1",
    type: "h1",
    children: [{ text: "Neimenovana novička" }],
  },
];

export default function MyEditor({
  article,
}: {
  article?: typeof Article.$inferSelect;
}) {
  const router = useRouter();
  const settings = settings_store.useStore();
  const update_article = api.article.update.useMutation({
    onSuccess: (_, variables) => {
      settings_store.set.settings_open(false);
      router.replace(`/uredi/${variables.url}`);
      save_store.set.saving_text(false);
      save_store.set.dirty(false);
      // console.log("Article updated", variables);
    },
  });

  const content = useMemo(
    () =>
      Array.isArray(article?.content) && article?.content.length > 0
        ? article?.content
        : INITIAL_VALUE,
    [article?.content],
  );

  useEffect(() => {
    /* console.log(
      "setting settings_store from useEffect",
      article?.title,
      article?.url,
    ); */
    settings_store.set.title(article?.title || "Neimenovana novička");
    settings_store.set.url(article?.url || "");
    settings_store.set.id(article?.id || "");
  }, [article]);

  const save_callback = (editor: PlateEditor) => {
    const title = get_title_from_editor(editor.children);

    if (!title) {
      alert(
        "Naslov ni nastavljen. Naslov mora biti v prvem odstavku in mora biti označen z H1 oznako.",
      );
      return;
    }

    const new_url = title.toLowerCase().replace(/\s/g, "-");

    const image_urls = get_images_from_editor(editor.children);
    settings_store.set.image_urls(image_urls);

    // console.log("Updating", { title, value, new_url, image_urls });

    const html = serializeHtml(editor, {
      nodes: editor.children,
      // if you use @udecode/plate-dnd
      dndWrapper: (props: any) => (
        <DndProvider backend={HTML5Backend} {...props} />
      ),
    });
    console.log({ html });

    update_article.mutate({
      id: settings_store.get.id(),
      title,
      content: editor.children,
      // contentHtml: html,
      url: new_url,
    });
  };

  return (
    <TooltipProvider>
      <DndProvider backend={HTML5Backend}>
        <Plate plugins={plugins(save_callback)} initialValue={content}>
          <FixedToolbar>
            <FixedToolbarButtons />
          </FixedToolbar>

          <Editor />

          <FloatingToolbar>
            <FloatingToolbarButtons />
          </FloatingToolbar>
        </Plate>
        <code>{JSON.stringify(settings, null, 4)}</code>
      </DndProvider>
    </TooltipProvider>
  );
}

function get_title_from_editor(value: Value) {
  const possible_h1 = value[0];
  if (!possible_h1 || possible_h1.type !== "h1") return;
  if (
    possible_h1.children.length !== 1 ||
    typeof possible_h1.children[0]?.text !== "string"
  )
    return;

  return possible_h1.children[0].text;
}

function get_images_from_editor(value: Value) {
  const image_urls = value
    .filter((child) => child.type === "img")
    .map((child) => {
      return child.url as string;
    });

  return image_urls;
}
