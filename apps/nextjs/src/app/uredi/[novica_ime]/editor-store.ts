import { createStore } from "zustand-x";

import type { ImageData } from "./editor-utils";

export const editor_store = createStore("editor")({
  id: -1,
  title: "",
  url: "",
  preview_image: undefined as string | undefined,
  image_data: [] as ImageData[],
});
