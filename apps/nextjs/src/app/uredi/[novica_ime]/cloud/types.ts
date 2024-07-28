import type { PlateEditor, Value } from "@udecode/plate-common/server";

/** Specifies just the `options` part of the CloudPlugin */
export interface CloudPlugin {
  upload_file_callback?: <V extends Value = Value>(
    editor: PlateEditor<V>,
    file: File,
  ) => Promise<void>;
}
