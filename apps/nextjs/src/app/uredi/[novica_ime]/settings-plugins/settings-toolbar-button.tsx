import React from "react";
import { GearIcon } from "@radix-ui/react-icons";
import { withRef } from "@udecode/cn";
import { useEditorRef } from "@udecode/plate-common";
import { serializeHtml } from "@udecode/plate-serializer-html";
import { DndProvider } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

import { ToolbarButton } from "~/components/plate-ui/toolbar";
import editor from "../editor";
import { useSettingsButton } from "./useSettingsButton";

export const SettingsToolbarButton = withRef<typeof ToolbarButton>(
  (rest, ref) => {
    const { props } = useSettingsButton();
    /* const editor = useEditorRef();

    const html = serializeHtml(editor, {
      nodes: editor.children,
      // if you use @udecode/plate-dnd
      dndWrapper: (props: any) => (
        <DndProvider backend={HTML5Backend} {...props} />
      ),
    }); 

    console.log({ html });*/

    return (
      <ToolbarButton ref={ref} tooltip="Settings" {...props} {...rest}>
        <GearIcon />
      </ToolbarButton>
    );
  },
);
