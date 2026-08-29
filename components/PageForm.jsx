"use client";

import { Button, Group, NumberInput, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { applyApiFieldErrors, getApiErrorMessage } from "../lib/form-errors";
import { formatSlugInput } from "../lib/sanitize";

export default function PageForm({ page }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const form = useForm({
    initialValues: {
      title: page.title,
      slug: page.slug,
      sort_order: page.sort_order,
    },
    validate: {
      title: (value) => (value.trim().length > 1 ? null : "Enter a page title"),
      slug: (value) => (value.trim().length > 0 ? null : "Enter a page slug"),
    },
  });

  const submit = async (values) => {
    setLoading(true);

    try {
      const response = await fetch(`/api/pages/${page.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      const payload = await response.json();

      if (!response.ok) {
        applyApiFieldErrors(form, payload.details);
        notifications.show({
          color: "red",
          title: "Page was not updated",
          message: getApiErrorMessage(payload, "Check the page details."),
        });
        return;
      }

      notifications.show({
        color: "green",
        title: "Page updated",
        message: "The page settings have been saved.",
      });
      modals.closeAll();
      router.refresh();
    } catch {
      notifications.show({
        color: "red",
        title: "Network error",
        message: "The page request could not be completed.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.onSubmit(submit)}>
      <Stack gap="md">
        <TextInput
          label="Title"
          description="The page name shown in the sidebar, like Home or About Us."
          {...form.getInputProps("title")}
        />
        <TextInput
          label="Slug"
          description="Used by the website API to find this page."
          value={form.values.slug}
          error={form.errors.slug}
          onChange={(event) =>
            form.setFieldValue("slug", formatSlugInput(event.currentTarget.value))
          }
        />
        <NumberInput
          label="Order in the page list"
          description="Controls the order pages appear in the sidebar. Lower numbers show first."
          min={0}
          {...form.getInputProps("sort_order")}
        />
        <Group justify="flex-end">
          <Button variant="subtle" onClick={() => modals.closeAll()}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            Save page
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
