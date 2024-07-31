import type { Value } from "@udecode/plate-common/server";
import { useEditorRef } from "@udecode/plate-common";
import { TText } from "@udecode/plate-common/server";
import { PlateEditor } from "@udecode/plate-core";

import { api } from "~/trpc/react";
import { settings_store } from "./settings-store";

export const useSettingsButton = () => {
  const editor = useEditorRef();

  return {
    props: {
      onClick: () => {},
      onMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
      },
    },
  };
};
