import { jsonError, jsonOk, validationError } from "../../../lib/api-response";
import { assertWebsiteAccess, requireApiUser } from "../../../lib/auth/require";
import { bumpContentVersion } from "../../../lib/data/mutations";
import {
  collectImageUrlsFromValue,
  deleteMediaUrls,
} from "../../../lib/media/storage";
import { getSupabaseAdmin } from "../../../lib/supabase/admin";
import { valuesSchema } from "../../../lib/validation/schemas";
import { normaliseFieldValue } from "../../../lib/validation/values";

export async function POST(request) {
  const auth = await requireApiUser();

  if (auth.response) {
    return auth.response;
  }

  try {
    const body = await request.json();
    const values = valuesSchema.parse(body);
    const supabase = getSupabaseAdmin();
    const fieldIds = values.values.map((item) => item.field_id);
    const { data: fields, error: fieldsError } = await supabase
      .from("fields")
      .select("*")
      .in("id", fieldIds);

    if (fieldsError) {
      return jsonError("Fields could not be loaded.", 400, fieldsError.message);
    }

    if (!fields || fields.length !== fieldIds.length) {
      return jsonError("One or more fields do not exist.", 404);
    }

    const websiteId = fields[0].website_id;
    const allSameWebsite = fields.every((field) => field.website_id === websiteId);

    if (!allSameWebsite) {
      return jsonError("Fields must belong to one website.", 422);
    }

    if (!assertWebsiteAccess(auth.context.profile, websiteId)) {
      return jsonError("You do not have permission to edit this website.", 403);
    }

    const fieldsById = fields.reduce((result, field) => {
      result[field.id] = field;
      return result;
    }, {});
    const { data: existingValues } = await supabase
      .from("field_values")
      .select("field_id, value")
      .in("field_id", fieldIds)
      .eq("website_id", websiteId);
    const existingByField = (existingValues || []).reduce((result, item) => {
      result[item.field_id] = item.value;
      return result;
    }, {});
    const rows = values.values.map((item) => ({
      field_id: item.field_id,
      website_id: websiteId,
      value: normaliseFieldValue(fieldsById[item.field_id], item.value),
    }));
    const orphanedUrls = [];

    for (const row of rows) {
      const field = fieldsById[row.field_id];
      const previousUrls = collectImageUrlsFromValue(field, existingByField[row.field_id]);
      const nextUrls = new Set(collectImageUrlsFromValue(field, row.value));

      for (const url of previousUrls) {
        if (!nextUrls.has(url)) {
          orphanedUrls.push(url);
        }
      }
    }

    const { error } = await supabase
      .from("field_values")
      .upsert(rows, { onConflict: "field_id" });

    if (error) {
      return jsonError("Content could not be saved.", 400, error.message);
    }

    await deleteMediaUrls(orphanedUrls);
    await bumpContentVersion(websiteId);

    return jsonOk({ ok: true });
  } catch (error) {
    if (error?.issues) {
      return validationError(error);
    }

    if (error instanceof Error) {
      return jsonError(error.message, 422);
    }

    return validationError(error);
  }
}
