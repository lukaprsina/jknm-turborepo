/** Indicates an `Upload` that is uploading and the state of the Upload */
export interface UploadProgress {
  finishPromise: Promise<UploadError | UploadSuccess>;
  sentBytes: number;
  status: "progress";
  totalBytes: number;
  url: string;
}

/** Indicates an `Upload` that has completed uploading */
export interface UploadSuccess {
  status: "success";
  url: string;
}

/**
 * Indicates an `Upload` that has an error during uploading and the Error
 * message
 */
export interface UploadError {
  message: string;
  status: "error";
  url: string;
}

/** Indicated the `Upload` could not be found. */
export interface UploadStateNotFound {
  status: "not-found";
  // no url here
}

export type Upload =
  | UploadError
  | UploadProgress
  | UploadStateNotFound
  | UploadSuccess;

/**
 * `UploadState`
 *
 * Types related to the `zustand` state-management library which we use to store
 * the state of uploads.
 */

export type GetUpload = (id: string) => Upload;

export type SetUpload = (id: string, upload: Upload) => void;

export interface UploadState {
  getUpload: GetUpload;
  setUpload: SetUpload;
  uploads: Record<string, Upload>;
}
