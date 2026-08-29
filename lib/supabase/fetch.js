const TIMEOUT_MS = 8000;

export function supabaseFetch(input, init = {}) {
  return fetch(input, {
    ...init,
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
}
