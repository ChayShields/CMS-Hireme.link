export const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;

export function isAllowedImageType(mimeType) {
  return typeof mimeType === "string" && mimeType.startsWith("image/");
}
