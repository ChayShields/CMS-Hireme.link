import crypto from "crypto";
import { jsonError, jsonOk } from "../../../lib/api-response";
import { assertWebsiteAccess, requireApiUser } from "../../../lib/auth/require";
import { compressImage } from "../../../lib/image/compress";
import { isAllowedImageType, MAX_UPLOAD_BYTES } from "../../../lib/media/constants";
import { deleteMediaByUrl } from "../../../lib/media/storage";
import { getSupabaseAdmin } from "../../../lib/supabase/admin";

export const runtime = "nodejs";

export async function POST(request) {
  const auth = await requireApiUser();

  if (auth.response) {
    return auth.response;
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const fieldId = formData.get("field_id");
    const previousUrl = formData.get("previous_url");

    if (!file || typeof file.arrayBuffer !== "function") {
      return jsonError("Choose an image to upload.", 422);
    }

    if (!fieldId) {
      return jsonError("Field is missing from the upload request.", 422);
    }

    if (typeof file.size === "number" && file.size > MAX_UPLOAD_BYTES) {
      return jsonError("Image must be 10MB or smaller.", 422);
    }

    if (!isAllowedImageType(file.type)) {
      return jsonError("Choose a valid image file.", 422);
    }

    const supabase = getSupabaseAdmin();
    const { data: field, error: fieldError } = await supabase
      .from("fields")
      .select("*")
      .eq("id", fieldId)
      .maybeSingle();

    if (fieldError || !field) {
      return jsonError("Upload field could not be found.", 404);
    }

    if (field.type !== "image" && field.type !== "repeater") {
      return jsonError("This field does not accept image uploads.", 422);
    }

    if (!assertWebsiteAccess(auth.context.profile, field.website_id)) {
      return jsonError("You do not have permission to upload to this website.", 403);
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    if (buffer.length > MAX_UPLOAD_BYTES) {
      return jsonError("Image must be 10MB or smaller.", 422);
    }

    const compressed = await compressImage(buffer);
    const folder = field.type === "repeater" ? "repeater" : null;
    const path = folder
      ? `${field.website_id}/${field.id}/${folder}/${crypto.randomUUID()}.webp`
      : `${field.website_id}/${field.id}/${crypto.randomUUID()}.webp`;
    const { error } = await supabase.storage.from("media").upload(path, compressed, {
      contentType: "image/webp",
      upsert: false,
    });

    if (error) {
      return jsonError("Image could not be uploaded.", 400, error.message);
    }

    if (typeof previousUrl === "string" && previousUrl) {
      await deleteMediaByUrl(previousUrl);
    }

    const { data } = supabase.storage.from("media").getPublicUrl(path);

    return jsonOk({
      url: data.publicUrl,
      size: compressed.length,
    });
  } catch (error) {
    console.error("[api] upload", error);
    return jsonError("The file could not be compressed. Please choose an image file.", 422);
  }
}
