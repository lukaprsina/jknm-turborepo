import { getPluginOptions, useEditorRef } from "@udecode/plate-common";

import type { SavePlugin } from "./save-plugin";
import { KEY_SAVE } from "./save-plugin";

export const useSaveButton = () => {
  const editor = useEditorRef();

  return {
    props: {
      onClick: () => {
        const { save_callback } = getPluginOptions<SavePlugin>(
          editor,
          KEY_SAVE,
        );

        if (!save_callback) return;

        save_callback(editor.children);
      },
      onMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
      },
    },
  };
};
