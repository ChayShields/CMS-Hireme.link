import { jsonError, jsonOk, validationError } from "../../../lib/api-response";
import { requireApiAdmin } from "../../../lib/auth/require";
import { bumpContentVersion, getWebsiteIdForPage } from "../../../lib/data/mutations";
import { getSupabaseAdmin } from "../../../lib/supabase/admin";
import { sectionSchema } from "../../../lib/validation/schemas";

export async function POST(request) {
  const auth = await requireApiAdmin();

  if (auth.response) {
    return auth.response;
  }

  try {
    const body = await request.json();
    const values = sectionSchema.parse(body);
    const websiteId = await getWebsiteIdForPage(values.page_id);

    if (!websiteId) {
      return jsonError("Page could not be found.", 404);
    }

    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("sections")
      .insert(values)
      .select("*")
      .single();

    if (error) {
      return jsonError("Section could not be created.", 400, error.message);
    }

    await bumpContentVersion(websiteId);

    return jsonOk({ section: data });
  } catch (error) {
    return validationError(error);
  }
}
