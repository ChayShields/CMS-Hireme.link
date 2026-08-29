"use client";

import { Button, Code, Group, Paper, Stack, Text, TextInput, Title } from "@mantine/core";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { applyApiFieldErrors, getApiErrorMessage } from "../lib/form-errors";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

export default function WebsiteForm({ website }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const editing = Boolean(website);
  const form = useForm({
    initialValues: {
      name: website?.name || "",
      domain: website?.domain || "",
      logo_url: website?.logo_url || "",
    },
    validate: {
      name: (value) => (value.trim().length > 1 ? null : "Enter a website name"),
      domain: (value) => (value.trim().length > 1 ? null : "Enter a domain"),
    },
  });

  const submit = async (values) => {
    setLoading(true);

    try {
      const response = await fetch(editing ? `/api/websites/${website.id}` : "/api/websites", {
        method: editing ? "PATCH" : "POST",
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
          title: editing ? "Website was not updated" : "Website was not created",
          message: getApiErrorMessage(payload, "Check the website details."),
        });
        return;
      }

      if (payload.apiKey) {
        setApiKey(payload.apiKey);
      }

      notifications.show({
        color: "green",
        title: editing ? "Website updated" : "Website created",
        message: editing ? "Website details have been saved." : "Copy the API key now.",
      });

      if (!editing) {
        router.push(`/dashboard/admin/websites/${payload.website.id}`);
      }

      router.refresh();
    } catch {
      notifications.show({
        color: "red",
        title: "Network error",
        message: "The website request could not be completed.",
      });
    } finally {
      setLoading(false);
    }
  };

  const regenerateKey = async () => {
    const response = await fetch(`/api/websites/${website.id}/regenerate-key`, {
      method: "POST",
    });
    const payload = await response.json();

    if (!response.ok) {
      notifications.show({
        color: "red",
        title: "API key was not regenerated",
        message: payload.error || "Try again.",
      });
      return;
    }

    setApiKey(payload.apiKey);
    notifications.show({
      color: "green",
      title: "API key regenerated",
      message: "Copy the new key now. The old key no longer works.",
    });
    router.refresh();
  };

  const deleteWebsite = () => {
    modals.open({
      title: "Delete website",
      centered: true,
      children: (
        <ConfirmDeleteModal
          title="Delete website"
          confirmLabel="Delete website"
          message="This permanently deletes the website, pages, sections, fields, values and customer profiles linked to it."
          onConfirm={async () => {
            const response = await fetch(`/api/websites/${website.id}`, {
              method: "DELETE",
            });
            const payload = await response.json();

            if (!response.ok) {
              notifications.show({
                color: "red",
                title: "Website was not deleted",
                message: payload.error || "Try again.",
              });
              return;
            }

            modals.closeAll();
            notifications.show({
              color: "green",
              title: "Website deleted",
              message: "The website has been permanently removed.",
            });
            router.push("/dashboard/admin/websites");
            router.refresh();
          }}
        />
      ),
    });
  };

  return (
    <Stack gap="lg">
      <form onSubmit={form.onSubmit(submit)}>
        <Stack gap="md">
          <TextInput label="Website name" placeholder="Acme Plumbing" {...form.getInputProps("name")} />
          <TextInput label="Domain" placeholder="acmeplumbing.co.uk" {...form.getInputProps("domain")} />
          <TextInput
            label="Logo URL"
            placeholder="https://..."
            {...form.getInputProps("logo_url")}
          />
          <Group justify="space-between">
            {editing ? (
              <Button color="red" variant="default" onClick={deleteWebsite}>
                Delete website
              </Button>
            ) : <span />}
            <Button type="submit" loading={loading}>
              {editing ? "Save website" : "Create website"}
            </Button>
          </Group>
        </Stack>
      </form>
      {editing ? (
        <Paper p="md">
          <Stack gap="sm">
            <Title order={3} fz="lg">
              API key
            </Title>
            <Text c="var(--cms-secondary)" fz="sm">
              Current key prefix: {website.api_key_prefix}
            </Text>
            <Button variant="default" onClick={regenerateKey} w="fit-content">
              Regenerate API key
            </Button>
          </Stack>
        </Paper>
      ) : null}
      {apiKey ? (
        <Paper p="md" bd="1px solid var(--cms-success)">
          <Stack gap="sm">
            <Title order={3} fz="lg">
              Copy this API key now
            </Title>
            <Text c="var(--cms-secondary)" fz="sm">
              This full key is only shown once.
            </Text>
            <Code block>{apiKey}</Code>
          </Stack>
        </Paper>
      ) : null}
    </Stack>
  );
}
