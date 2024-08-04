import type { OutputData } from "@editorjs/editorjs";
import { createStore } from "zustand-x";

import type { ImageData } from "./editor-utils";

export const settings_store = createStore("settings")({
  title: "",
  url: "",
  editor_content: null as OutputData | null,
  preview_image: null as string | null,
  image_data: [] as ImageData[],
});
