import type { PlateEditor, Value } from "@udecode/plate-common/server";
import { createPluginFactory } from "@udecode/plate-common/server";

import type { CloudPlugin } from "./types";
import { onDropCloud, onPasteCloud } from "./handlers";

export const KEY_CLOUD = "cloud";

export const createCloudPlugin = createPluginFactory<
  CloudPlugin,
  Value,
  PlateEditor
>({
  handlers: {
    onDrop: (editor) => (e) => onDropCloud(editor, e),
    onPaste: (editor) => (e) => onPasteCloud(editor, e),
  },
  key: KEY_CLOUD,
});
