import { Paper, Stack, Text, Title } from "@mantine/core";
import { redirect } from "next/navigation";
import LinkButton from "../../components/LinkButton";
import { requireSession } from "../../lib/auth/require";
import { getPagesForWebsite, resolveActiveWebsite } from "../../lib/data/content";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const { profile } = await requireSession();
  const website = await resolveActiveWebsite(profile);
  const pages = await getPagesForWebsite(website?.id);

  if (pages[0]) {
    redirect(`/dashboard/pages/${pages[0].id}`);
  }

  return (
    <Paper p={{ base: "lg", sm: "xl" }}>
      <Stack gap="sm" maw={640}>
        <Title order={1}>
          {profile.role === "admin" ? "No pages yet" : "No pages to edit yet"}
        </Title>
        <Text c="var(--cms-secondary)">
          {profile.role === "admin"
            ? "Create a website and add pages from the admin area."
            : "Your administrator has not added any pages yet."}
        </Text>
        {profile.role === "admin" ? (
          <LinkButton href="/dashboard/admin/websites" w="fit-content">
            Manage websites
          </LinkButton>
        ) : null}
      </Stack>
    </Paper>
  );
}
