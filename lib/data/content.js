import { cache } from "react";
import { cookies } from "next/headers";
import { NotFoundError } from "../errors";
import { getSupabaseAdmin } from "../supabase/admin";

export const getWebsites = cache(async () => {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("websites")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  return data || [];
});

export const getWebsiteById = cache(async (websiteId) => {
  if (!websiteId) {
    return null;
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("websites")
    .select("*")
    .eq("id", websiteId)
    .maybeSingle();

  if (error) {
    throw error;
  }

  return data;
});

export const resolveActiveWebsite = cache(async (profile) => {
  if (profile.role === "customer") {
    return getWebsiteById(profile.website_id);
  }

  const cookieStore = await cookies();
  const activeWebsiteId = cookieStore.get("active_website_id")?.value;
  const websites = await getWebsites();

  if (activeWebsiteId) {
    const active = websites.find((website) => website.id === activeWebsiteId);

    if (active) {
      return active;
    }
  }

  return websites[0] || null;
});

export const getPagesForWebsite = cache(async (websiteId) => {
  if (!websiteId) {
    return [];
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .eq("website_id", websiteId)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (error) {
    throw error;
  }

  return data || [];
});

export async function getPageBundle(pageId, websiteId) {
  if (!pageId || !websiteId) {
    return null;
  }

  const supabase = getSupabaseAdmin();
  const { data: page, error: pageError } = await supabase
    .from("pages")
    .select("*")
    .eq("id", pageId)
    .eq("website_id", websiteId)
    .maybeSingle();

  if (pageError) {
    throw pageError;
  }

  if (!page) {
    return null;
  }

  const { data: sections, error: sectionsError } = await supabase
    .from("sections")
    .select("*")
    .eq("page_id", page.id)
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });

  if (sectionsError) {
    throw sectionsError;
  }

  const sectionIds = (sections || []).map((section) => section.id);
  const { data: fields, error: fieldsError } = sectionIds.length
    ? await supabase
        .from("fields")
        .select("*")
        .in("section_id", sectionIds)
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true })
    : { data: [], error: null };

  if (fieldsError) {
    throw fieldsError;
  }

  const fieldIds = (fields || []).map((field) => field.id);
  const { data: values, error: valuesError } = fieldIds.length
    ? await supabase
        .from("field_values")
        .select("*")
        .in("field_id", fieldIds)
        .eq("website_id", websiteId)
    : { data: [], error: null };

  if (valuesError) {
    throw valuesError;
  }

  const fieldsBySection = (fields || []).reduce((result, field) => {
    result[field.section_id] ||= [];
    result[field.section_id].push(field);
    return result;
  }, {});

  const valuesByField = (values || []).reduce((result, item) => {
    result[item.field_id] = item.value;
    return result;
  }, {});

  return {
    page,
    sections: (sections || []).map((section) => ({
      ...section,
      fields: fieldsBySection[section.id] || [],
    })),
    values: valuesByField,
  };
}

export async function getPublicPageBundle(websiteId, slug) {
  if (!websiteId || !slug) {
    throw new NotFoundError("Page could not be found.");
  }

  const supabase = getSupabaseAdmin();
  const { data: page, error: pageError } = await supabase
    .from("pages")
    .select("*")
    .eq("website_id", websiteId)
    .eq("slug", slug)
    .maybeSingle();

  if (pageError) {
    throw pageError;
  }

  if (!page) {
    throw new NotFoundError("Page could not be found.");
  }

  const bundle = await getPageBundle(page.id, websiteId);

  if (!bundle) {
    throw new NotFoundError("Page could not be found.");
  }

  return bundle;
}
