import type * as portiveClient from "@portive/client";
import type { PlateEditor, Value } from "@udecode/plate-common/server";

import type { Upload } from "../upload";
import type { createUploadStore } from "../upload/createUploadStore";

/** Specifies just the `options` part of the CloudPlugin */
export interface CloudPlugin {
  upload_file_callback?: <V extends Value = Value>(
    editor: PlateEditor<V>,
    file: File,
  ) => Promise<void>;
}

export type PlateCloudEditor<V extends Value = Value> = CloudEditorProps<V> &
  PlateEditor<V>;

export interface FinishUploadsOptions {
  maxTimeoutInMs?: number;
}

export interface CloudEditorProps<V extends Value = Value> {
  cloud: {
    client: portiveClient.Client;
    finishUploads: (options?: FinishUploadsOptions) => Promise<void>;
    genericFileHandlers?: {
      onError?: (e: ErrorEvent & FileEvent) => void;
      onProgress?: (e: FileEvent & ProgressEvent) => void;
      onStart?: (e: FileEvent) => void;
      onSuccess?: (e: FileEvent & SuccessEvent) => void;
    };
    getSaveValue: () => V;
    imageFileHandlers?: {
      onError?: (e: ErrorEvent & ImageFileEvent) => void;
      onProgress?: (e: ImageFileEvent & ProgressEvent) => void;
      onStart?: (e: ImageFileEvent) => void;
      onSuccess?: (e: ImageFileEvent & SuccessEvent) => void;
    };
    uploadFiles: (msg: any) => void;
    uploadStore: ReturnType<typeof createUploadStore>;
    // save: (options: { maxTimeoutInMs?: number }) => Promise<V>;
  };
}

/**
 * The part of the FileEvent shared between the GenericFileEvent and the
 * ImageFileEvent.
 */
export interface FileEventBase {
  file: File;
  id: string;
  url: string;
}

/** FileEvent for files that are not images */
export type GenericFileEvent = {
  type: "generic";
} & FileEventBase;

/** FileEvent for files that are images */
export type ImageFileEvent = {
  height: number;
  type: "image";
  width: number;
} & FileEventBase;

/** FileEvent for any type of file (generic or image) */
export type FileEvent = GenericFileEvent | ImageFileEvent;

/** Indicates upload in progress */
export interface ProgressEvent {
  sentBytes: number;
  totalBytes: number;
}

/** Indicates an error during upload */
export interface ErrorEvent {
  message: string;
}

/** Indicates a successful upload */
export interface SuccessEvent {
  url: string;
}
