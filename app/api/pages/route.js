import { jsonError, jsonOk, validationError } from "../../../lib/api-response";
import { requireApiAdmin } from "../../../lib/auth/require";
import { bumpContentVersion } from "../../../lib/data/mutations";
import { getSupabaseAdmin } from "../../../lib/supabase/admin";
import { pageSchema } from "../../../lib/validation/schemas";

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
