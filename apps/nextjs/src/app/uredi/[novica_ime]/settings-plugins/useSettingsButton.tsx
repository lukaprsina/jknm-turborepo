import { useEditorRef } from "@udecode/plate-common";

import type { ImageElement } from "~/components/plate-ui/image-element";

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
            return child.url as typeof ImageElement;
          });

        console.log(image_urls);
      },
      onMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
      },
    },
  };
};
