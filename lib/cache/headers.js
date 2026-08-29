export function publicContentHeaders(etag) {
  return {
    "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
    ETag: etag,
  };
}
