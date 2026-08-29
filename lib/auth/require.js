import { redirect } from "next/navigation";
import { jsonError } from "../api-response";
import { getSupabaseAdmin } from "../supabase/admin";
import { createSupabaseServerClient } from "../supabase/server";

export async function getSessionContext() {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return null;
  }

  const admin = getSupabaseAdmin();
  const { data: profile, error: profileError } = await admin
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  if (profileError || !profile) {
    return null;
  }

  return { user, profile };
}

export async function requireSession() {
  const context = await getSessionContext();

  if (!context) {
    redirect("/login");
  }

  return context;
}

export async function requireAdmin() {
  const context = await requireSession();

  if (context.profile.role !== "admin") {
    redirect("/dashboard");
  }

  return context;
}

export async function requireApiUser() {
  const context = await getSessionContext();

  if (!context) {
    return {
      response: jsonError("You need to log in again.", 401),
    };
  }

  return { context };
}

export async function requireApiAdmin() {
  const auth = await requireApiUser();

  if (auth.response) {
    return auth;
  }

  if (auth.context.profile.role !== "admin") {
    return {
      response: jsonError("You do not have permission to do that.", 403),
    };
  }

  return auth;
}

export function getAllowedWebsiteId(profile, requestedWebsiteId) {
  if (profile.role === "admin") {
    return requestedWebsiteId;
  }

  return profile.website_id;
}

export function assertWebsiteAccess(profile, requestedWebsiteId) {
  if (profile.role === "admin") {
    return true;
  }

  return profile.website_id === requestedWebsiteId;
}
