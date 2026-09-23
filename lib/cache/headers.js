// Public content responses must never be shared by a CDN. Vercel's edge
// cache keys on the URL only, and the website is identified by an API key
// header, so a `public` cache would hand one site's content to another
// site's key, a wrong key, or no key at all for as long as the entry lives
// (found and reproduced on production 2026-09-22). `private, no-store`
// keeps every request going through the key check. The ETag stays so a
// client that does send If-None-Match still gets a cheap 304; the
// connected sites already cache the content for 60 seconds themselves.
export function publicContentHeaders(etag) {
  return {
    "Cache-Control": "private, no-store",
    ETag: etag,
  };
}
