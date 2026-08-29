import { getSupabaseAdmin } from "../supabase/admin";

export { MAX_UPLOAD_BYTES, isAllowedImageType } from "./constants";

export function getMediaPathFromUrl(url) {
  if (!url || typeof url !== "string") {
    return null;
  }

  const marker = "/storage/v1/object/public/media/";
  const index = url.indexOf(marker);

  if (index === -1) {
    return null;
  }

  return decodeURIComponent(url.slice(index + marker.length).split("?")[0]);
}

export async function deleteMediaByUrl(url) {
  const path = getMediaPathFromUrl(url);

  if (!path) {
    return;
  }

  const supabase = getSupabaseAdmin();
  await supabase.storage.from("media").remove([path]);
}

export async function deleteMediaUrls(urls) {
  const paths = [...new Set((urls || []).map(getMediaPathFromUrl).filter(Boolean))];

  if (paths.length === 0) {
    return;
  }

  const supabase = getSupabaseAdmin();
  await supabase.storage.from("media").remove(paths);
}

export async function deleteMediaFolder(websiteId, fieldId) {
  if (!websiteId || !fieldId) {
    return;
  }

  const supabase = getSupabaseAdmin();
  const prefixes = [`${websiteId}/${fieldId}`, `${websiteId}/${fieldId}/repeater`];

  for (const prefix of prefixes) {
    const { data } = await supabase.storage.from("media").list(prefix, {
      limit: 1000,
    });
    const paths = (data || [])
      .filter((entry) => entry?.name && !entry.name.endsWith("/"))
      .map((entry) => `${prefix}/${entry.name}`);

    if (paths.length > 0) {
      await supabase.storage.from("media").remove(paths);
    }
  }
}

export function collectImageUrlsFromValue(field, value) {
  if (field.type === "image") {
    return value ? [String(value)] : [];
  }

  if (field.type !== "repeater") {
    return [];
  }

  const rows = Array.isArray(value) ? value : [];
  const imageKeys = (field.config?.subfields || [])
    .filter((subfield) => subfield.type === "image")
    .map((subfield) => subfield.key);
  const urls = [];

  for (const row of rows) {
    for (const key of imageKeys) {
      if (row?.[key]) {
        urls.push(String(row[key]));
      }
    }
  }

  return urls;
}
