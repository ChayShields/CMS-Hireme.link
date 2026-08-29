import { jsonError, jsonOk, validationError } from "../../../../lib/api-response";
import { requireApiAdmin } from "../../../../lib/auth/require";
import { bumpContentVersion, getWebsiteIdForField } from "../../../../lib/data/mutations";
import { deleteMediaFolder } from "../../../../lib/media/storage";
import { getSupabaseAdmin } from "../../../../lib/supabase/admin";
import { fieldSchema } from "../../../../lib/validation/schemas";

export async function PATCH(request, { params }) {
  const auth = await requireApiAdmin();

  if (auth.response) {
    return auth.response;
  }

  try {
    const { fieldId } = await params;
    const body = await request.json();
    const values = fieldSchema.omit({ section_id: true }).parse(body);
    const websiteId = await getWebsiteIdForField(fieldId);

    if (!websiteId) {
      return jsonError("Field could not be found.", 404);
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("fields")
      .update(values)
      .eq("id", fieldId)
      .select("*")
      .single();

    if (error) {
      return jsonError("Field could not be updated.", 400, error.message);
    }

    await bumpContentVersion(websiteId);

    return jsonOk({ field: data });
  } catch (error) {
    return validationError(error);
  }
}

export async function DELETE(request, { params }) {
  const auth = await requireApiAdmin();

  if (auth.response) {
    return auth.response;
  }

  const { fieldId } = await params;
  const websiteId = await getWebsiteIdForField(fieldId);

  if (!websiteId) {
    return jsonError("Field could not be found.", 404);
  }

  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("fields").delete().eq("id", fieldId);

  if (error) {
    return jsonError("Field could not be deleted.", 400, error.message);
  }

  await deleteMediaFolder(websiteId, fieldId);
  await bumpContentVersion(websiteId);

  return jsonOk({ ok: true });
}
