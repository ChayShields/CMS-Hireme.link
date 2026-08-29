import crypto from "crypto";
import { NextResponse } from "next/server";
import { jsonError } from "../../../../../lib/api-response";
import { publicContentHeaders } from "../../../../../lib/cache/headers";
import { getPublicPageBundle } from "../../../../../lib/data/content";
import { isNotFoundError } from "../../../../../lib/errors";
import { hashApiKey } from "../../../../../lib/keys";
import { serializePageContent } from "../../../../../lib/public-api/serialize";
import { getSupabaseAdmin } from "../../../../../lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(request, { params }) {
  const { slug } = await params;
  const apiKey = getApiKey(request);

  if (!apiKey) {
    return jsonError("Send an API key in x-api-key or Authorization.", 401);
  }

  const supabase = getSupabaseAdmin();
  const { data: website, error: websiteError } = await supabase
    .from("websites")
    .select("*")
    .eq("api_key_hash", hashApiKey(apiKey))
    .single();

  if (websiteError || !website) {
    return jsonError("The API key is not valid.", 401);
  }

  try {
    const bundle = await getPublicPageBundle(website.id, slug);
    const payload = serializePageContent(bundle);
    const etag = createEtag(website, slug);

    if (request.headers.get("if-none-match") === etag) {
      return new NextResponse(null, {
        status: 304,
        headers: publicContentHeaders(etag),
      });
    }

    return NextResponse.json(payload, {
      headers: publicContentHeaders(etag),
    });
  } catch (error) {
    if (isNotFoundError(error)) {
      return jsonError("Page could not be found.", 404);
    }

    console.error("[api] public page", error);
    return jsonError("Page could not be loaded.", 500);
  }
}

function getApiKey(request) {
  const headerKey = request.headers.get("x-api-key");

  if (headerKey) {
    return headerKey;
  }

  const auth = request.headers.get("authorization");

  if (auth?.toLowerCase().startsWith("bearer ")) {
    return auth.slice(7);
  }

  return "";
}

function createEtag(website, slug) {
  const hash = crypto
    .createHash("sha1")
    .update(`${website.id}:${website.content_version}:${slug}`)
    .digest("hex");

  return `W/"${hash}"`;
}
