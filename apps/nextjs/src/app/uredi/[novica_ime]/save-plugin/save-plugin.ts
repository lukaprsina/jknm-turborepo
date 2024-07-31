"use client";

import type { Value } from "@udecode/plate-common";
import type {
  KeyboardHandlerReturnType,
  PlateEditor,
  WithPlatePlugin,
} from "@udecode/plate-common/server";
import { useEffect } from "react";
import { getPluginOptions, useEditorRef } from "@udecode/plate-common";
import { isHotkey } from "@udecode/plate-common/server";
import { createPluginFactory } from "@udecode/plate-core";

import { api } from "~/trpc/react";
import { settings_store } from "../settings-plugins/settings-store";
import { save_store } from "./save-store";

export const KEY_SAVE = "save";

export interface SavePlugin {
  hotkey?: string | string[];
  save_callback?: (value: Value) => void;
  autosave_on_lost_focus?: boolean;
  autosave_on_before_unload?: boolean;
  autosave_after_inactive?: boolean;
  autosave_after_inactive_ms?: number;
  max_ms_without_autosave?: number;
}

export const onKeyDownSave =
  <V extends Value = Value, E extends PlateEditor<V> = PlateEditor<V>>(
    editor: E,
    { options }: WithPlatePlugin<SavePlugin, V, E>,
  ): KeyboardHandlerReturnType =>
  (event) => {
    if (event.defaultPrevented) return;

    if (!options.hotkey || !options.save_callback) return;

    if (isHotkey(options.hotkey, event)) {
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

function save(editor: PlateEditor<Value>) {
  get_stuff_from_editor(editor);
}

export const createSavePlugin = createPluginFactory<SavePlugin>({
  key: KEY_SAVE,
  useHooks: () => {
    const editor = useEditorRef();

    const { save_callback, autosave_on_before_unload } =
      getPluginOptions<SavePlugin>(editor, KEY_SAVE);

    const update_article = api.article.update.useMutation({
      onSuccess: (_, variables) => {
        settings_store.set.settings_open(false);
        console.log("Article updated", variables);
      },
    });

    save_store.use.saving;

    useEffect(() => {
      if (!autosave_on_before_unload) return;

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
          if (!save_store.get.dirty()) return;

          save_store.set.saving(true);
          // save_callback(value);
          save(editor);
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

function get_title_from_editor(editor: PlateEditor<Value>) {
  const possible_h1 = editor.children[0];
  if (!possible_h1 || possible_h1.type !== "h1") return;
  if (
    possible_h1.children.length !== 1 ||
    typeof possible_h1.children[0]?.text !== "string"
  )
    return;

  return possible_h1.children[0].text;
}

function get_images_from_editor(editor: PlateEditor<Value>) {
  const image_urls = editor.children
    .filter((child) => child.type === "img")
    .map((child) => {
      return child.url as string;
    });

  return image_urls;
}

function get_stuff_from_editor(editor: PlateEditor<Value>) {
  const title = get_title_from_editor(editor);

  if (!title) {
    alert(
      "Naslov ni pravilno nastavljen. Naslov mora biti v prvem odstavku in mora biti označen z H1 oznako.",
    );
    return;
  }

  const new_url = title.toLowerCase().replace(/\s/g, "-");

  const image_urls = get_images_from_editor(editor);
  settings_store.set.image_urls(image_urls);

  console.log("Updating", title, editor.children, new_url);

  /* update_article.mutate({
          id: settings_store.get.id(),
          title,
          content: editor.children,
          url: new_url,
        }); */
}
