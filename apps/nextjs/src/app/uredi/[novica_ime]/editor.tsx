"use client";

import { Plate } from "@udecode/plate-common";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { Article } from "@acme/db/schema";

import { Editor } from "~/components/plate-ui/editor";
import { FixedToolbar } from "~/components/plate-ui/fixed-toolbar";
import { FixedToolbarButtons } from "~/components/plate-ui/fixed-toolbar-buttons";
import { FloatingToolbar } from "~/components/plate-ui/floating-toolbar";
import { FloatingToolbarButtons } from "~/components/plate-ui/floating-toolbar-buttons";
import { TooltipProvider } from "~/components/plate-ui/tooltip";
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
  return (
    <TooltipProvider>
      <DndProvider backend={HTML5Backend}>
        <Plate
          plugins={plugins}
          initialValue={article?.content ?? INITIAL_VALUE}
        >
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
