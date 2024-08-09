import { createStore } from "zustand-x";

import type { ImageData } from "./editor-utils";

export const settings_store = createStore("settings")({
  title: "",
  url: "",
  preview_image: undefined as string | undefined,
  image_data: [] as ImageData[],
});
