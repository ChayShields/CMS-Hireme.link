"use client";

import { Button, Group, NumberInput, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { applyApiFieldErrors, getApiErrorMessage } from "../lib/form-errors";
import { formatKeyInput } from "../lib/sanitize";

export default function SectionForm({ pageId, section }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const editing = Boolean(section);
  const form = useForm({
    initialValues: {
      name: section?.name || "",
      key: section?.key || "",
      sort_order: section?.sort_order || 0,
    },
    validate: {
      name: (value) => (value.trim().length > 1 ? null : "Enter a section name"),
      key: (value) => (value.trim().length > 0 ? null : "Enter a section key"),
    },
  });

  const submit = async (values) => {
    setLoading(true);

    try {
      const response = await fetch(editing ? `/api/sections/${section.id}` : "/api/sections", {
        method: editing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editing ? values : { ...values, page_id: pageId }),
      });
      const payload = await response.json();

      if (!response.ok) {
        applyApiFieldErrors(form, payload.details);
        notifications.show({
          color: "red",
          title: editing ? "Section was not updated" : "Section was not created",
          message: getApiErrorMessage(payload, "Check the section details."),
        });
        return;
      }

      notifications.show({
        color: "green",
        title: editing ? "Section updated" : "Section created",
        message: "The page structure has been updated.",
      });
      modals.closeAll();
      router.refresh();
    } catch {
      notifications.show({
        color: "red",
        title: "Network error",
        message: "The section request could not be completed.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.onSubmit(submit)}>
      <Stack gap="md">
        <TextInput
          label="Section name"
          description="The friendly name shown in the editor, like Hero section or FAQ section."
          placeholder="Hero section"
          {...form.getInputProps("name")}
        />
        <TextInput
          label="Section key"
          description="Used by the website API to find this section."
          placeholder="hero"
          value={form.values.key}
          error={form.errors.key}
          onChange={(event) =>
            form.setFieldValue("key", formatKeyInput(event.currentTarget.value))
          }
        />
        <NumberInput
          label="Order on the page"
          description="Controls the order sections appear on the page. Lower numbers show first."
          min={0}
          {...form.getInputProps("sort_order")}
        />
        <Group justify="flex-end">
          <Button variant="subtle" onClick={() => modals.closeAll()}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {editing ? "Save section" : "Create section"}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
