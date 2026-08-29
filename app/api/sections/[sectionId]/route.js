import { jsonError, jsonOk, validationError } from "../../../../lib/api-response";
import { requireApiAdmin } from "../../../../lib/auth/require";
import { bumpContentVersion, getWebsiteIdForSection } from "../../../../lib/data/mutations";
import { getSupabaseAdmin } from "../../../../lib/supabase/admin";
import { sectionSchema } from "../../../../lib/validation/schemas";

export async function PATCH(request, { params }) {
  const auth = await requireApiAdmin();

  if (auth.response) {
    return auth.response;
  }

  try {
    const { sectionId } = await params;
    const body = await request.json();
    const values = sectionSchema.omit({ page_id: true }).parse(body);
    const websiteId = await getWebsiteIdForSection(sectionId);

    if (!websiteId) {
      return jsonError("Section could not be found.", 404);
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("sections")
      .update(values)
      .eq("id", sectionId)
      .select("*")
      .single();

    if (error) {
      return jsonError("Section could not be updated.", 400, error.message);
    }

    await bumpContentVersion(websiteId);

    return jsonOk({ section: data });
  } catch (error) {
    return validationError(error);
  }
}

export async function DELETE(request, { params }) {
  const auth = await requireApiAdmin();

  if (auth.response) {
    return auth.response;
  }

  const { sectionId } = await params;
  const websiteId = await getWebsiteIdForSection(sectionId);

  if (!websiteId) {
    return jsonError("Section could not be found.", 404);
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("sections").delete().eq("id", sectionId);

  if (error) {
    return jsonError("Section could not be deleted.", 400, error.message);
  }

  await bumpContentVersion(websiteId);

  return jsonOk({ ok: true });
}
