import { cookies } from "next/headers";
import { z } from "zod";
import { jsonOk, validationError } from "../../../lib/api-response";
import { requireApiAdmin } from "../../../lib/auth/require";
import { idSchema } from "../../../lib/validation/schemas";

const schema = z.object({
  website_id: idSchema("Choose a website"),
});

export async function POST(request) {
  const auth = await requireApiAdmin();

  if (auth.response) {
    return auth.response;
  }

  try {
    const body = await request.json();
    const values = schema.parse(body);

    const cookieStore = await cookies();
    cookieStore.set("active_website_id", values.website_id, {
      httpOnly: true,
      sameSite: "lax",
      path: "/",
    });

    return jsonOk({ ok: true });
  } catch (error) {
    return validationError(error);
  }
}
