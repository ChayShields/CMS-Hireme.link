import { jsonError, jsonOk, validationError } from "../../../../lib/api-response";
import { requireApiAdmin } from "../../../../lib/auth/require";
import { getSupabaseAdmin } from "../../../../lib/supabase/admin";
import { userLookupSchema } from "../../../../lib/validation/schemas";

export async function POST(request) {
  const auth = await requireApiAdmin();

  if (auth.response) {
    return auth.response;
  }

  try {
    const body = await request.json();
    const values = userLookupSchema.parse(body);
    const supabase = getSupabaseAdmin();
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("*")
      .ilike("email", values.email)
      .maybeSingle();

    if (error) {
      return jsonError("User could not be found.", 400, error.message);
    }

    if (!profile) {
      return jsonError("No user was found with that email.", 404);
    }

    let websiteName = null;

    if (profile.website_id) {
      const { data: website } = await supabase
        .from("websites")
        .select("name")
        .eq("id", profile.website_id)
        .maybeSingle();

      websiteName = website?.name || null;
    }

    return jsonOk({
      profile: {
        id: profile.id,
        full_name: profile.full_name,
        email: profile.email,
        role: profile.role,
        website_id: profile.website_id,
        websiteName,
      },
    });
  } catch (error) {
    return validationError(error);
  }
}
