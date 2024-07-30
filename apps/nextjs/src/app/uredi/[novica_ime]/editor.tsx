"use client";

import { useEffect, useMemo } from "react";
import { Plate } from "@udecode/plate-common";
import { type Value } from "@udecode/plate-common/server";
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
import { settings_store } from "./settings-plugins/settings-store";

const INITIAL_VALUE = [
  {
    id: "1",
    type: "h1",
    children: [{ text: "Neimenovana novička" }],
  },
];

export default function PlateEditor({
  article,
}: {
  article?: typeof Article.$inferSelect;
}) {
  const settings = settings_store.useStore();
  const update_article = api.article.update.useMutation({
    onSuccess: (_, variables) => {
      settings_store.set.settings_open(false);
      console.log("Article updated", variables);
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
    settings_store.set.title(article?.title || "Neimenovana novička");
    settings_store.set.url(article?.url || "");
  });

  const save_callback = (value: Value) => {
    update_article.mutate({
      title: settings.title,
      content: value,
      url: settings.url,
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
