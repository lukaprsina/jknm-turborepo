import { createStore } from "zustand-x";

import type { ImageData } from "./editor-utils";

export const settings_store = createStore("settings")({
  id: -1,
  title: "",
  url: "",
  preview_image: undefined as string | undefined,
  image_data: [] as ImageData[],
});
