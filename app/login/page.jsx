import { Anchor, Box, Paper, Stack, Text, Title } from "@mantine/core";
import LoginForm from "../../components/LoginForm";

export const dynamic = "force-dynamic";

export default function LoginPage() {
  return (
    <Box
      bg="var(--cms-background)"
      mih="100dvh"
      px={{ base: "md", sm: "xl" }}
      py={{ base: 48, sm: 72 }}
    >
      <Stack maw={440} mx="auto" gap="xl">
        <Stack gap={8} ta="center">
          <Title order={1} c="var(--cms-primary)" fz={{ base: 36, sm: 44 }}>
            CMS
          </Title>
          <Text c="var(--cms-secondary)" fz="sm">
            Login to your CMS account.
          </Text>
        </Stack>
        <Paper p={{ base: "lg", sm: "xl" }}>
          <LoginForm />
        </Paper>
        <Text ta="center" c="var(--cms-secondary)" fz="sm">
          Need access? Ask your CMS admin to create a login with a password
          password.
        </Text>
        <Anchor href="/" ta="center" c="var(--cms-secondary)" fz="sm">
          Back to CMS
        </Anchor>
      </Stack>
    </Box>
  );
}
