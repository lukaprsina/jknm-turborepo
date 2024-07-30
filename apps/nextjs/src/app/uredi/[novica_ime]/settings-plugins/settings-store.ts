import { createStore } from "zustand-x";

export const settings_store = createStore("settings")({
  settings_open: false,
  image_urls: [] as string[],
  title: "",
  url: "",
});
