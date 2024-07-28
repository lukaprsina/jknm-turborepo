import { createStore } from "zustand-x";

export const save_store = createStore("save")({
  saving: false,
  dirty: false,
});
