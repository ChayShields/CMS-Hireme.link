import { jsonError, jsonOk, validationError } from "../../../lib/api-response";
import { requireApiAdmin } from "../../../lib/auth/require";
import { getSupabaseAdmin } from "../../../lib/supabase/admin";
import { userSchema } from "../../../lib/validation/schemas";

export async function POST(request) {
  const auth = await requireApiAdmin();

  if (auth.response) {
    return auth.response;
  }

  try {
    const body = await request.json();
    const values = userSchema.parse(body);
    const supabase = getSupabaseAdmin();
    const { data: authUser, error: createError } = await supabase.auth.admin.createUser({
      email: values.email,
      password: values.password,
      email_confirm: true,
      user_metadata: {
        full_name: values.full_name,
      },
    });

    if (createError) {
      return jsonError("Login could not be created.", 400, createError.message);
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: authUser.user.id,
        role: "customer",
        full_name: values.full_name,
        email: values.email,
        website_id: values.website_id,
      })
      .select("*")
      .single();

    if (profileError) {
      await supabase.auth.admin.deleteUser(authUser.user.id);
      return jsonError("Login profile could not be created.", 400, profileError.message);
    }

    return jsonOk({ profile });
  } catch (error) {
    return validationError(error);
  }
}
