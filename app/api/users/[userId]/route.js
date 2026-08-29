import { jsonError, jsonOk, validationError } from "../../../../lib/api-response";
import { requireApiAdmin } from "../../../../lib/auth/require";
import { getSupabaseAdmin } from "../../../../lib/supabase/admin";
import { resetPasswordSchema } from "../../../../lib/validation/schemas";

export async function PATCH(request, { params }) {
  const auth = await requireApiAdmin();

  if (auth.response) {
    return auth.response;
  }

  try {
    const { userId } = await params;
    const body = await request.json();
    const values = resetPasswordSchema.parse(body);
    const supabase = getSupabaseAdmin();
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle();

    if (profileError) {
      return jsonError("Password could not be updated.", 400, profileError.message);
    }

    if (!profile) {
      return jsonError("No user was found.", 404);
    }

    const { error } = await supabase.auth.admin.updateUserById(userId, {
      password: values.password,
    });

    if (error) {
      return jsonError("Password could not be updated.", 400, error.message);
    }

    return jsonOk({ ok: true });
  } catch (error) {
    return validationError(error);
  }
}

export async function DELETE(request, { params }) {
  const auth = await requireApiAdmin();

  if (auth.response) {
    return auth.response;
  }

  const { userId } = await params;
  const supabase = getSupabaseAdmin();
  const { error } = await supabase.auth.admin.deleteUser(userId);

  if (error) {
    return jsonError("Login could not be deleted.", 400, error.message);
  }

  return jsonOk({ ok: true });
}
