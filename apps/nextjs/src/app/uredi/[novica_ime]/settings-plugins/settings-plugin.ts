import type {
  KeyboardHandlerReturnType,
  PlateEditor,
  WithPlatePlugin,
} from "@udecode/plate-common/server";
import { getPluginOptions, Value } from "@udecode/plate-common";
import { isHotkey } from "@udecode/plate-common/server";
import { createPluginFactory } from "@udecode/plate-core";

export interface SettingsPlugin {
  hotkey?: string | string[];
}

export const KEY_SETTINGS = "settings";

export const createSavePlugin = createPluginFactory<SettingsPlugin>({
  key: KEY_SETTINGS,
});
