import { jsonError, jsonOk } from "../../../../../lib/api-response";
import { requireApiAdmin } from "../../../../../lib/auth/require";
import { generateApiKey, getApiKeyPrefix, hashApiKey } from "../../../../../lib/keys";
import { getSupabaseAdmin } from "../../../../../lib/supabase/admin";

export async function POST(request, { params }) {
  const auth = await requireApiAdmin();

  if (auth.response) {
    return auth.response;
  }

  const { websiteId } = await params;
  const apiKey = generateApiKey();
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("websites")
    .update({
      api_key_hash: hashApiKey(apiKey),
      api_key_prefix: getApiKeyPrefix(apiKey),
    })
    .eq("id", websiteId)
    .select("*")
    .single();

  if (error) {
    return jsonError("API key could not be regenerated.", 400, error.message);
  }

  return jsonOk({ website: data, apiKey });
}
