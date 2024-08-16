import { createStore } from "zustand-x";

import type { EditorJSImageData } from "./plugins";

export const gallery_store = createStore("gallery")({
  images: [] as EditorJSImageData[],
  default_image: undefined as EditorJSImageData | undefined,
});
