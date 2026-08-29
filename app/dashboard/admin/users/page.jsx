import { Stack, Text, Title } from "@mantine/core";
import UsersManager from "../../../../components/UsersManager";
import { requireAdmin } from "../../../../lib/auth/require";
import { getWebsites } from "../../../../lib/data/content";
import { getSupabaseAdmin } from "../../../../lib/supabase/admin";

export const dynamic = "force-dynamic";

export default async function UsersPage() {
  await requireAdmin();
  const supabase = getSupabaseAdmin();
  const websites = await getWebsites();
  const { data: profiles, error } = await supabase
    .from("profiles")
    .select("*")
    .eq("role", "customer")
    .order("created_at", { ascending: false });

  if (error) {
    throw error;
  }

  const users = (profiles || []).map((profile) => {
    const website = websites.find((item) => item.id === profile.website_id);

    return {
      ...profile,
      websiteName: website?.name || "Unknown website",
    };
  });

  return (
    <Stack gap="lg">
      <Stack gap={4}>
        <Title order={1}>Customer logins</Title>
        <Text c="var(--cms-secondary)">
          Create one-website customer logins with passwords.
        </Text>
      </Stack>
      <UsersManager users={users} websites={websites} />
    </Stack>
  );
}
