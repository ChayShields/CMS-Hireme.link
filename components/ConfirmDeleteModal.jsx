"use client";

import { Button, Group, Stack, Text } from "@mantine/core";
import { modals } from "@mantine/modals";

export default function ConfirmDeleteModal({ title, message, confirmLabel, onConfirm }) {
  return (
    <Stack gap="md">
      <Text c="var(--cms-secondary)">{message}</Text>
      <Group justify="flex-end">
        <Button variant="subtle" onClick={() => modals.closeAll()}>
          Cancel
        </Button>
        <Button color="red" onClick={onConfirm}>
          {confirmLabel || title}
        </Button>
      </Group>
    </Stack>
  );
}
