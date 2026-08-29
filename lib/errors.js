export class NotFoundError extends Error {
  constructor(message = "Not found") {
    super(message);
    this.name = "NotFoundError";
  }
}

export function isNotFoundError(error) {
  return (
    error instanceof NotFoundError ||
    error?.name === "NotFoundError" ||
    error?.code === "PGRST116"
  );
}
