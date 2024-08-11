export class FileExistsError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FileExistsError";
    Error.captureStackTrace(this, this.constructor);
  }
}
