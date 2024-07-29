import { useEditorRef } from "@udecode/plate-common";

import { settings_store } from "./settings-store";

export const useSettingsButton = () => {
  const editor = useEditorRef();

  return {
    props: {
      onClick: () => {
        /* const {  } = getPluginOptions<SettingsPlugin>(
          editor,
          KEY_SETTINGS,
        ); */
        settings_store.set.settings_open(!settings_store.get.settings_open());

        const image_urls = editor.children
          .filter((child) => child.type === "img")
          .map((child) => {
            return child.url as string;
          });

        settings_store.set.image_urls(image_urls);
      },
      onMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
      },
    },
  };
};
