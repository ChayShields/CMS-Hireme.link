import { jsonError, jsonOk, validationError } from "../../../lib/api-response";
import { requireApiAdmin } from "../../../lib/auth/require";
import { getPageBundle, getPagesForWebsite } from "../../../lib/data/content";
import { bumpContentVersion } from "../../../lib/data/mutations";
import { getSupabaseAdmin } from "../../../lib/supabase/admin";
import { pageSchema } from "../../../lib/validation/schemas";

export async function GET(request) {
  const auth = await requireApiAdmin();

  if (auth.response) {
    return auth.response;
  }

  const websiteId = new URL(request.url).searchParams.get("website_id");

  if (!websiteId) {
    return jsonError("website_id is required.", 422);
  }

  const pages = await getPagesForWebsite(websiteId);
  const bundles = await Promise.all(
    pages.map((page) => getPageBundle(page.id, websiteId)),
  );

  return jsonOk({
    pages: bundles.map((bundle) => ({
      id: bundle.page.id,
      title: bundle.page.title,
      slug: bundle.page.slug,
      sort_order: bundle.page.sort_order,
      sections: bundle.sections.map((section) => ({
        id: section.id,
        name: section.name,
        key: section.key,
        sort_order: section.sort_order,
        fields: section.fields.map((field) => ({
          id: field.id,
          label: field.label,
          key: field.key,
          type: field.type,
          required: field.required,
          sort_order: field.sort_order,
          config: field.config,
        })),
      })),
    })),
  });
}

export async function POST(request) {
  const auth = await requireApiAdmin();

  if (auth.response) {
    return auth.response;
  }

  try {
    const body = await request.json();
    const values = pageSchema.parse(body);

    if (!values.website_id) {
      return jsonError("Choose a website before creating a page.", 422);
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("pages")
      .insert(values)
      .select("*")
      .single();

    if (error) {
      return jsonError("Page could not be created.", 400, error.message);
    }

    await bumpContentVersion(values.website_id);

    return jsonOk({ page: data });
  } catch (error) {
    return validationError(error);
  }
}
