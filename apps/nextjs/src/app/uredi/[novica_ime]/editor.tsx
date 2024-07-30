"use client";

import { useMemo } from "react";
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
  const update_article = api.article.update.useMutation();

  const content = useMemo(
    () =>
      Array.isArray(article?.content) && article?.content.length > 0
        ? article?.content
        : INITIAL_VALUE,
    [article?.content],
  );

  const save_callback = (value: Value) => {
    update_article.mutate({
      title: "test",
      content: value,
      url: "test",
    });
    console.log("update_article save_callback", { update_article });
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
      </DndProvider>
    </TooltipProvider>
  );
}
