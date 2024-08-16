import { createStore } from "zustand-x";

import type { EditorJSImageData } from "./plugins";

export const image_store = createStore("image")({
  gallery_image: undefined as EditorJSImageData | undefined,
});
