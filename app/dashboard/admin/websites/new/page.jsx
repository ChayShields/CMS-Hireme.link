import { Paper, Stack, Text, Title } from "@mantine/core";
import WebsiteForm from "../../../../../components/WebsiteForm";
import { requireAdmin } from "../../../../../lib/auth/require";

export const dynamic = "force-dynamic";

export default async function NewWebsitePage() {
  await requireAdmin();

  return (
    <Stack gap="lg" maw={760}>
      <Stack gap={4}>
        <Title order={1}>New website</Title>
        <Text c="var(--cms-secondary)">
          Add a customer website and generate its first API key.
        </Text>
      </Stack>
      <Paper p={{ base: "lg", sm: "xl" }}>
        <WebsiteForm />
      </Paper>
    </Stack>
  );
}
