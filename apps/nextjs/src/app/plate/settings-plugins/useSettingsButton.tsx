import { getPluginOptions, useEditorRef } from "@udecode/plate-common";

import { MyImageElement } from "../plate-types";
import { KEY_SETTINGS, SettingsPlugin } from "./settings-plugin";

export const useSettingsButton = () => {
  const editor = useEditorRef();

  return {
    props: {
      onClick: () => {
        /* const {  } = getPluginOptions<SettingsPlugin>(
          editor,
          KEY_SETTINGS,
        ); */
        console.log(editor.children);

        const image_urls = editor.children
          .filter((child) => child.type === "img")
          .map((child) => {
            return child.url as unknown as MyImageElement;
          });

        console.log(image_urls);
      },
      onMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
      },
    },
  };
};
