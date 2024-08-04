import { createStore } from "zustand-x";

import type { ImageData } from "./editor-utils";

export const settings_store = createStore("settings")({
  title: "",
  url: "",
  image_data: [] as ImageData[],
});
