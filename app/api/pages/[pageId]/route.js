import { jsonError, jsonOk, validationError } from "../../../../lib/api-response";
import { requireApiAdmin } from "../../../../lib/auth/require";
import { bumpContentVersion, getWebsiteIdForPage } from "../../../../lib/data/mutations";
import { getSupabaseAdmin } from "../../../../lib/supabase/admin";
import { pageSchema } from "../../../../lib/validation/schemas";

export async function PATCH(request, { params }) {
  const auth = await requireApiAdmin();

  if (auth.response) {
    return auth.response;
  }

  try {
    const { pageId } = await params;
    const body = await request.json();
    const values = pageSchema.omit({ website_id: true }).parse(body);
    const websiteId = await getWebsiteIdForPage(pageId);

    if (!websiteId) {
      return jsonError("Page could not be found.", 404);
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("pages")
      .update(values)
      .eq("id", pageId)
      .select("*")
      .single();

    if (error) {
      return jsonError("Page could not be updated.", 400, error.message);
    }

    await bumpContentVersion(websiteId);

    return jsonOk({ page: data });
  } catch (error) {
    return validationError(error);
  }
}

export async function DELETE(request, { params }) {
  const auth = await requireApiAdmin();

  if (auth.response) {
    return auth.response;
  }

  const { pageId } = await params;
  const websiteId = await getWebsiteIdForPage(pageId);

  if (!websiteId) {
    return jsonError("Page could not be found.", 404);
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("pages").delete().eq("id", pageId);

  if (error) {
    return jsonError("Page could not be deleted.", 400, error.message);
  }

  await bumpContentVersion(websiteId);

  return jsonOk({ ok: true });
}
