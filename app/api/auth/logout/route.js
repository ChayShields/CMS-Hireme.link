import { jsonOk } from "../../../../lib/api-response";
import { createSupabaseServerClient } from "../../../../lib/supabase/server";

export async function POST() {
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();

  return jsonOk({ ok: true });
}
