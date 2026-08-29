import { jsonError, jsonOk, validationError } from "../../../../lib/api-response";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";
import { loginSchema } from "../../../../lib/validation/schemas";

export async function POST(request) {
  try {
    const body = await request.json();
    const values = loginSchema.parse(body);
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase.auth.signInWithPassword(values);

    if (error) {
      return jsonError("The email or password is not correct.", 401);
    }

    return jsonOk({ ok: true });
  } catch (error) {
    return validationError(error);
  }
}
