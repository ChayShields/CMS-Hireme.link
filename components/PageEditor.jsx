"use client";

import {
  Accordion,
  AccordionControl,
  AccordionItem,
  AccordionPanel,
  ActionIcon,
  Button,
  Group,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LuPencil, LuPlus, LuTrash2 } from "react-icons/lu";
import { getApiErrorMessage } from "../lib/form-errors";
import ConfirmDeleteModal from "./ConfirmDeleteModal";
import FieldForm from "./FieldForm";
import FieldInput from "./FieldInput";
import PageForm from "./PageForm";
import SectionForm from "./SectionForm";

export default function PageEditor({ page, sections, values, profile }) {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const isAdmin = profile?.role === "admin";
  const initialValues = sections.reduce((result, section) => {
    section.fields.forEach((field) => {
      result[field.id] = values[field.id] ?? getDefaultValue(field.type);
    });
    return result;
  }, {});
  const form = useForm({
    initialValues: {
      values: initialValues,
    },
  });

  const saveContent = async (formValues) => {
    const allFields = sections.flatMap((section) => section.fields);

    if (allFields.length === 0) {
      notifications.show({
        color: "red",
        title: "Nothing to save",
        message: "This page has no content to save yet.",
      });
      return;
    }

    setSaving(true);

    try {
      const response = await fetch("/api/values", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          values: allFields.map((field) => ({
            field_id: field.id,
            value: formValues.values[field.id],
          })),
        }),
      });
      const payload = await response.json();

      if (!response.ok) {
        notifications.show({
          color: "red",
          title: "Content was not saved",
          message: getApiErrorMessage(payload, "Check the fields and try again."),
        });
        return;
      }

      notifications.show({
        color: "green",
        title: "Changes saved",
        message: `Your updates to the ${page.title} page are now live.`,
      });
      router.refresh();
    } catch {
      notifications.show({
        color: "red",
        title: "Network error",
        message: "The content save request could not be completed.",
      });
    } finally {
      setSaving(false);
    }
  };

  const openPageSettings = () => {
    modals.open({
      title: "Page settings",
      centered: true,
      children: <PageForm page={page} />,
    });
  };

  const openSectionCreate = () => {
    if (!isAdmin) {
      return;
    }

    modals.open({
      title: "Add section",
      centered: true,
      children: <SectionForm pageId={page.id} />,
    });
  };

  const openSectionEdit = (section) => {
    if (!isAdmin) {
      return;
    }

    modals.open({
      title: "Edit section",
      centered: true,
      children: <SectionForm pageId={page.id} section={section} />,
    });
  };

  const openFieldCreate = (section) => {
    modals.open({
      title: "Add field",
      centered: true,
      size: "lg",
      children: <FieldForm sectionId={section.id} />,
    });
  };

  const openFieldEdit = (field) => {
    modals.open({
      title: "Edit field",
      centered: true,
      size: "lg",
      children: <FieldForm field={field} />,
    });
  };

  const deletePage = () => {
    modals.open({
      title: "Delete page",
      centered: true,
      children: (
        <ConfirmDeleteModal
          title="Delete page"
          confirmLabel="Delete page"
          message="This permanently deletes the page, its sections, fields and saved values."
          onConfirm={async () => {
            const response = await fetch(`/api/pages/${page.id}`, { method: "DELETE" });
            const payload = await response.json();

            if (!response.ok) {
              notifications.show({
                color: "red",
                title: "Page was not deleted",
                message: payload.error || "Try again.",
              });
              return;
            }

            modals.closeAll();
            notifications.show({
              color: "green",
              title: "Page deleted",
              message: "The page has been permanently removed.",
            });
            router.push("/dashboard");
            router.refresh();
          }}
        />
      ),
    });
  };

  const deleteSection = (section) => {
    if (!isAdmin) {
      return;
    }

    modals.open({
      title: "Delete section",
      centered: true,
      children: (
        <ConfirmDeleteModal
          title="Delete section"
          confirmLabel="Delete section"
          message={`This permanently deletes ${section.name} and every field inside it.`}
          onConfirm={async () => {
            const response = await fetch(`/api/sections/${section.id}`, { method: "DELETE" });
            const payload = await response.json();

            if (!response.ok) {
              notifications.show({
                color: "red",
                title: "Section was not deleted",
                message: payload.error || "Try again.",
              });
              return;
            }

            modals.closeAll();
            notifications.show({
              color: "green",
              title: "Section deleted",
              message: "The section has been permanently removed.",
            });
            router.refresh();
          }}
        />
      ),
    });
  };

  const deleteField = (field) => {
    modals.open({
      title: "Delete field",
      centered: true,
      children: (
        <ConfirmDeleteModal
          title="Delete field"
          confirmLabel="Delete field"
          message={`This permanently deletes ${field.label} and its saved value.`}
          onConfirm={async () => {
            const response = await fetch(`/api/fields/${field.id}`, { method: "DELETE" });
            const payload = await response.json();

            if (!response.ok) {
              notifications.show({
                color: "red",
                title: "Field was not deleted",
                message: payload.error || "Try again.",
              });
              return;
            }

            modals.closeAll();
            notifications.show({
              color: "green",
              title: "Field deleted",
              message: "The field has been permanently removed.",
            });
            router.refresh();
          }}
        />
      ),
    });
  };

  return (
    <form onSubmit={form.onSubmit(saveContent)}>
      <Stack gap="lg">
        <Group justify="space-between" align="flex-start">
          <Stack gap={6} maw={640}>
            <Title fz="1.4rem" order={1}>
              Editing {page.title}
            </Title>
            <Text c="var(--cms-secondary)" fz="sm">
              Open a section below to change that part of the page, then press
              Save changes.
            </Text>
          </Stack>
          <Group gap="xs">
            {isAdmin ? (
              <>
                <Button variant="default" onClick={openPageSettings}>
                  Page settings
                </Button>
                <Button variant="default" onClick={openSectionCreate} leftSection={<LuPlus size={16} />}>
                  Add section
                </Button>
                <Button color="red" variant="default" onClick={deletePage}>
                  Delete page
                </Button>
              </>
            ) : null}
            <Button type="submit" loading={saving}>
              Save changes
            </Button>
          </Group>
        </Group>
        {sections.length > 0 ? (
          <Accordion multiple defaultValue={[]} variant="separated" radius={8}>
            {sections.map((section) => (
              <AccordionItem key={section.id} value={section.id}>
                <AccordionControl>
                  <Stack gap={2}>
                    <Text fw={700} fz="lg">
                      {section.name}
                    </Text>
                    {isAdmin ? (
                      <Text c="var(--cms-secondary)" fz="sm">
                        {section.fields.length === 1
                          ? "1 item"
                          : `${section.fields.length} items`}
                        {` · ${section.key}`}
                      </Text>
                    ) : null}
                  </Stack>
                </AccordionControl>
                <AccordionPanel>
                  <Stack gap="md">
                    {isAdmin ? (
                      <Group gap={6}>
                        <Button
                          variant="default"
                          size="compact-sm"
                          leftSection={<LuPlus size={15} />}
                          onClick={() => openFieldCreate(section)}
                        >
                          Add field
                        </Button>
                        <Button
                          variant="default"
                          size="compact-sm"
                          leftSection={<LuPencil size={15} />}
                          onClick={() => openSectionEdit(section)}
                        >
                          Edit section
                        </Button>
                        <Button
                          color="red"
                          variant="default"
                          size="compact-sm"
                          leftSection={<LuTrash2 size={15} />}
                          onClick={() => deleteSection(section)}
                        >
                          Delete section
                        </Button>
                      </Group>
                    ) : null}
                    {section.fields.map((field) => (
                      <Paper key={field.id} p="md" className="field-surface">
                        <Stack gap="sm">
                          <Group justify="space-between" align="flex-start" wrap="nowrap">
                            <Stack gap={2} miw={0} flex={1}>
                              <Text fw={600}>{field.label}</Text>
                              {isAdmin ? (
                                <Text c="var(--cms-secondary)" fz="xs">
                                  {field.key} · {fieldTypeLabel(field.type)}
                                </Text>
                              ) : null}
                            </Stack>
                            {isAdmin ? (
                              <Group gap={4} wrap="nowrap">
                                <ActionIcon
                                  variant="subtle"
                                  onClick={() => openFieldEdit(field)}
                                  aria-label={`Edit ${field.label}`}
                                >
                                  <LuPencil size={15} />
                                </ActionIcon>
                                <ActionIcon
                                  color="red"
                                  variant="subtle"
                                  onClick={() => deleteField(field)}
                                  aria-label={`Delete ${field.label}`}
                                >
                                  <LuTrash2 size={15} />
                                </ActionIcon>
                              </Group>
                            ) : null}
                          </Group>
                          <FieldInput
                            field={field}
                            value={form.values.values[field.id]}
                            hideLabel
                            onChange={(value) =>
                              form.setFieldValue(`values.${field.id}`, value)
                            }
                          />
                        </Stack>
                      </Paper>
                    ))}
                    {section.fields.length === 0 ? (
                      <Text c="var(--cms-secondary)" fz="sm">
                        {isAdmin
                          ? "No items in this section yet. Add a field to start."
                          : "This part of the page is not set up yet."}
                      </Text>
                    ) : null}
                  </Stack>
                </AccordionPanel>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <Paper p="xl">
            <Stack gap="sm">
              <Title order={2}>This page is empty</Title>
              <Text c="var(--cms-secondary)">
                {isAdmin
                  ? "Add a section to create a part of this page that can be edited."
                  : "Ask your administrator to set up this page."}
              </Text>
              {isAdmin ? (
                <Button onClick={openSectionCreate} w="fit-content">
                  Add section
                </Button>
              ) : null}
            </Stack>
          </Paper>
        )}
      </Stack>
    </form>
  );
}

function fieldTypeLabel(type) {
  const labels = {
    text: "text",
    textarea: "large text",
    number: "number",
    image: "photo",
    link: "button or link",
    boolean: "yes or no",
    select: "dropdown",
    richtext: "rich text",
    repeater: "list",
  };

  return labels[type] || type;
}

function getDefaultValue(type) {
  if (type === "number") {
    return "";
  }

  if (type === "boolean") {
    return false;
  }

  if (type === "link") {
    return { text: "", url: "" };
  }

  if (type === "repeater") {
    return [];
  }

  return "";
}
