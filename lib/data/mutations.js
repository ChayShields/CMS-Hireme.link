import { getSupabaseAdmin } from "../supabase/admin";

export async function bumpContentVersion(websiteId) {
  const supabase = getSupabaseAdmin();
  const { data: website, error: loadError } = await supabase
    .from("websites")
    .select("content_version")
    .eq("id", websiteId)
    .maybeSingle();

  if (loadError) {
    throw loadError;
  }

  if (!website) {
    return;
  }

  const { error } = await supabase
    .from("websites")
    .update({ content_version: (website.content_version || 1) + 1 })
    .eq("id", websiteId);

  if (error) {
    throw error;
  }
}

export async function getWebsiteIdForPage(pageId) {
  if (!pageId) {
    return null;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("pages")
    .select("website_id")
    .eq("id", pageId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.website_id || null;
}

export async function getWebsiteIdForSection(sectionId) {
  if (!sectionId) {
    return null;
  }

  const supabase = getSupabaseAdmin();
  const { data: section, error: sectionError } = await supabase
    .from("sections")
    .select("page_id")
    .eq("id", sectionId)
    .maybeSingle();

  if (sectionError) {
    throw sectionError;
  }

  if (!section) {
    return null;
  }

  return getWebsiteIdForPage(section.page_id);
}

export async function getWebsiteIdForField(fieldId) {
  if (!fieldId) {
    return null;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("fields")
    .select("website_id")
    .eq("id", fieldId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data?.website_id || null;
}
