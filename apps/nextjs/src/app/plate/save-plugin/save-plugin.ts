import type {
  KeyboardHandlerReturnType,
  PlateEditor,
  WithPlatePlugin,
} from "@udecode/plate-common/server";
import { useEffect } from "react";
import { getPluginOptions, Value } from "@udecode/plate-common";
import { isHotkey } from "@udecode/plate-common/server";
import { createPluginFactory } from "@udecode/plate-core";

import { save_store } from "./save-store";

export const KEY_SAVE = "save";

export type SavePlugin = {
  hotkey?: string | string[];
  save_callback?: (value: Value) => void;
  autosave_on_lost_focus?: boolean;
  autosave_on_before_unload?: boolean;
  autosave_after_inactive?: boolean;
  autosave_after_inactive_ms?: number;
  max_ms_without_autosave?: number;
};

export const onKeyDownSave =
  <V extends Value = Value, E extends PlateEditor<V> = PlateEditor<V>>(
    editor: E,
    { options }: WithPlatePlugin<SavePlugin, V, E>,
  ): KeyboardHandlerReturnType =>
  (event) => {
    if (event.defaultPrevented) return;

    if (!options.hotkey || !options.save_callback) return;

    if (isHotkey(options.hotkey, event as any)) {
      event.preventDefault();
      event.stopPropagation();

      save_store.set.saving(true);
      options.save_callback(editor.children);
      setTimeout(() => {
        save_store.set.saving(false);
      }, 1500);

      clearTimeout(save_timeout_id);
      clearTimeout(save_max_time_timeout_id);
    }
  };

let save_timeout_id: number | undefined = undefined;
let save_max_time_timeout_id: number | undefined = undefined;

export const createSavePlugin = createPluginFactory<SavePlugin>({
  key: KEY_SAVE,
  useHooks: () => {
    useEffect(() => {
      const onBeforeUnload = (e: BeforeUnloadEvent) => {
        if (save_store.get.dirty()) e.preventDefault();
      };

      window.addEventListener("beforeunload", onBeforeUnload);

      return () => {
        window.removeEventListener("beforeunload", onBeforeUnload);
      };
    });
  },
  handlers: {
    onKeyDown: onKeyDownSave,
    onChange: (editor) => (value) => {
      const {
        save_callback,
        autosave_after_inactive,
        autosave_after_inactive_ms,
        max_ms_without_autosave,
      } = getPluginOptions<SavePlugin>(editor, KEY_SAVE);

      if (!save_callback) {
        alert("Save callback not set");
        return;
      }

      if (!autosave_after_inactive) return;

      clearTimeout(save_timeout_id);
      save_store.set.dirty(true);

      if (typeof save_max_time_timeout_id === "undefined") {
        save_max_time_timeout_id = setTimeout(() => {
          if (!save_store.get.dirty) return;

          save_store.set.saving(true);
          save_callback(value);
          setTimeout(() => {
            save_store.set.saving(false);
          }, 1500);

          save_store.set.dirty(false);
          save_max_time_timeout_id = undefined;
        }, max_ms_without_autosave) as unknown as number;
      }

      save_timeout_id = setTimeout(() => {
        save_store.set.saving(true);
        save_callback(value);
        setTimeout(() => {
          save_store.set.saving(false);
        }, 1500);

        save_store.set.dirty(false);
        save_max_time_timeout_id = undefined;
      }, autosave_after_inactive_ms) as unknown as number;
    },
  },
  options: {
    hotkey: ["ctrl+s"],
    save_callback: () => {
      alert("Save callback not set");
    },
    autosave_after_inactive: false,
    autosave_after_inactive_ms: 10 * 1000,
    max_ms_without_autosave: 60 * 1000,
  },
});
