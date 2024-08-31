import { createStore } from "zustand-x";

import type { EditorJSImageData } from "~/components/plugins";

interface EditorStoreType {
  id: number;
  title: string;
  url: string;
  preview_image: string | undefined;
  author_ids: string[];
  image_data: EditorJSImageData[];
}

export const editor_store = createStore("editor")<EditorStoreType>({
  id: -1,
  title: "",
  url: "",
  preview_image: undefined,
  author_ids: [],
  image_data: [],
});
