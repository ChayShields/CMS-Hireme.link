import { Paper, Stack, Text, Title } from "@mantine/core";
import { notFound } from "next/navigation";
import WebsiteForm from "../../../../../components/WebsiteForm";
import { requireAdmin } from "../../../../../lib/auth/require";
import { getWebsiteById } from "../../../../../lib/data/content";

export const dynamic = "force-dynamic";

export default async function WebsiteEditPage({ params }) {
  const { websiteId } = await params;
  await requireAdmin();
  const website = await getWebsiteById(websiteId);

  if (!website) {
    notFound();
  }

  return (
    <Stack gap="xl" maw={820}>
      <Stack gap={8}>
        <Text className="page-kicker">Websites</Text>
        <Title order={1}>{website.name}</Title>
        <Text c="var(--cms-secondary)">
          Edit website details and API access for {website.domain}.
        </Text>
      </Stack>
      <Paper p={{ base: "lg", sm: "xl" }}>
        <WebsiteForm website={website} />
      </Paper>
    </Stack>
  );
}
