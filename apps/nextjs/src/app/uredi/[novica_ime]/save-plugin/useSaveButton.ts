import { useEditorRef } from "@udecode/plate-common";

import { save_store } from "./save-store";

export const useSaveButton = () => {
  const editor = useEditorRef();

  return {
    props: {
      onClick: () => {
        save_store.set.saving(true);
      },
      onMouseDown: (e: React.MouseEvent<HTMLButtonElement>) => {
        e.preventDefault();
      },
    },
  };
};
