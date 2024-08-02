import { createStore } from "zustand-x";

export const save_store = createStore("save")({
  saving: false,
  saving_text: false,
  dirty: false,
});
