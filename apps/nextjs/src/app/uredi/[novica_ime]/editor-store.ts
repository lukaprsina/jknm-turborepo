import { createStore } from "zustand-x";



import type { EditorJSImageData } from "~/components/plugins";


export const editor_store = createStore("editor")({
  id: -1,
  title: "",
  url: "",
  preview_image: undefined as string | undefined,
  image_data: [] as EditorJSImageData[],
});