import { jsonError, jsonOk, validationError } from "../../../../lib/api-response";
import { requireApiAdmin } from "../../../../lib/auth/require";
import { getSupabaseAdmin } from "../../../../lib/supabase/admin";
import { websiteSchema } from "../../../../lib/validation/schemas";

export async function PATCH(request, { params }) {
  const auth = await requireApiAdmin();

  if (auth.response) {
    return auth.response;
  }

  try {
    const { websiteId } = await params;
    const body = await request.json();
    const values = websiteSchema.parse(body);
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("websites")
      .update(values)
      .eq("id", websiteId)
      .select("*")
      .single();

    if (error) {
      return jsonError("Website could not be updated.", 400, error.message);
    }

    return jsonOk({ website: data });
  } catch (error) {
    return validationError(error);
  }
}

export async function DELETE(request, { params }) {
  const auth = await requireApiAdmin();

  if (auth.response) {
    return auth.response;
  }

  const { websiteId } = await params;
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.from("websites").delete().eq("id", websiteId);

  if (error) {
    return jsonError("Website could not be deleted.", 400, error.message);
  }

  return jsonOk({ ok: true });
}
