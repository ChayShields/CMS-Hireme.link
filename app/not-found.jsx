import { Paper, Stack, Text, Title } from "@mantine/core";
import LinkButton from "../components/LinkButton";

export default function NotFound() {
  return (
    <Stack
      mih="100dvh"
      align="center"
      justify="center"
      px="md"
      bg="var(--cms-background)"
    >
      <Paper p={{ base: "lg", sm: "xl" }} maw={480} w="100%">
        <Stack gap="md">
          <Text className="page-kicker">404</Text>
          <Title order={1}>Page not found</Title>
          <Text c="var(--cms-secondary)">
            This page does not exist, or you do not have access to it for the
            current website.
          </Text>
          <LinkButton href="/dashboard" w="fit-content">
            Back to dashboard
          </LinkButton>
        </Stack>
      </Paper>
    </Stack>
  );
}
