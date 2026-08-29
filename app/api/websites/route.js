import { jsonError, jsonOk, validationError } from "../../../lib/api-response";
import { requireApiAdmin } from "../../../lib/auth/require";
import { generateApiKey, getApiKeyPrefix, hashApiKey } from "../../../lib/keys";
import { getSupabaseAdmin } from "../../../lib/supabase/admin";
import { websiteSchema } from "../../../lib/validation/schemas";

export async function POST(request) {
  const auth = await requireApiAdmin();

  if (auth.response) {
    return auth.response;
  }

  try {
    const body = await request.json();
    const values = websiteSchema.parse(body);
    const apiKey = generateApiKey();
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("websites")
      .insert({
        ...values,
        api_key_hash: hashApiKey(apiKey),
        api_key_prefix: getApiKeyPrefix(apiKey),
      })
      .select("*")
      .single();

    if (error) {
      return jsonError("Website could not be created.", 400, error.message);
    }

    return jsonOk({ website: data, apiKey });
  } catch (error) {
    return validationError(error);
  }
}
