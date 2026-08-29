import { Group, Paper, SimpleGrid, Stack, Text, Title } from "@mantine/core";
import LinkButton from "../../../../components/LinkButton";
import LinkPaper from "../../../../components/LinkPaper";
import { requireAdmin } from "../../../../lib/auth/require";
import { getWebsites } from "../../../../lib/data/content";

export const dynamic = "force-dynamic";

export default async function WebsitesPage() {
  await requireAdmin();
  const websites = await getWebsites();

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="flex-start">
        <Stack gap={4}>
          <Title order={1}>Websites</Title>
          <Text c="var(--cms-secondary)">
            Create customer websites and manage their API keys.
          </Text>
        </Stack>
        <LinkButton href="/dashboard/admin/websites/new">New website</LinkButton>
      </Group>
      <SimpleGrid cols={{ base: 1, md: 2, xl: 3 }}>
        {websites.map((website) => (
          <LinkPaper
            key={website.id}
            href={`/dashboard/admin/websites/${website.id}`}
            p="lg"
            className="action-card"
          >
            <Stack gap={6}>
              <Title order={2} fz="lg">
                {website.name}
              </Title>
              <Text c="var(--cms-secondary)" fz="sm">
                {website.domain}
              </Text>
              <Text c="var(--cms-secondary)" fz="xs">
                API prefix: {website.api_key_prefix}
              </Text>
            </Stack>
          </LinkPaper>
        ))}
      </SimpleGrid>
      {websites.length === 0 ? (
        <Paper p="xl">
          <Stack gap="sm">
            <Title order={2}>No websites yet</Title>
            <Text c="var(--cms-secondary)">
              Create the first customer website to start adding pages and content fields.
            </Text>
          </Stack>
        </Paper>
      ) : null}
    </Stack>
  );
}
