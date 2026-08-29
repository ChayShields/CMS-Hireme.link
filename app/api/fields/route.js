import { jsonError, jsonOk, validationError } from "../../../lib/api-response";
import { requireApiAdmin } from "../../../lib/auth/require";
import { bumpContentVersion, getWebsiteIdForSection } from "../../../lib/data/mutations";
import { getSupabaseAdmin } from "../../../lib/supabase/admin";
import { fieldSchema } from "../../../lib/validation/schemas";

export async function POST(request) {
  const auth = await requireApiAdmin();

  if (auth.response) {
    return auth.response;
  }

  try {
    const body = await request.json();
    const values = fieldSchema.parse(body);
    const websiteId = await getWebsiteIdForSection(values.section_id);

    if (!websiteId) {
      return jsonError("Section could not be found.", 404);
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("fields")
      .insert({
        ...values,
        website_id: websiteId,
      })
      .select("*")
      .single();

    if (error) {
      return jsonError("Field could not be created.", 400, error.message);
    }

    await bumpContentVersion(websiteId);

    return jsonOk({ field: data });
  } catch (error) {
    return validationError(error);
  }
}
