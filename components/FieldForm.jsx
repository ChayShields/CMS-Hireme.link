"use client";

import {
  ActionIcon,
  Button,
  Checkbox,
  Group,
  NumberInput,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
  Textarea,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { LuTrash2 } from "react-icons/lu";
import { applyApiFieldErrors, getApiErrorMessage } from "../lib/form-errors";
import { formatKeyInput } from "../lib/sanitize";

const fieldTypeOptions = [
  { value: "text", label: "Text" },
  { value: "textarea", label: "Large text" },
  { value: "number", label: "Number" },
  { value: "image", label: "Image upload" },
  { value: "link", label: "Button/link" },
  { value: "boolean", label: "Yes / no switch" },
  { value: "select", label: "Dropdown" },
  { value: "richtext", label: "Rich text" },
  { value: "repeater", label: "Repeatable list" },
];

const repeaterTypeOptions = fieldTypeOptions.filter((option) => option.value !== "repeater");

export default function FieldForm({ sectionId, field }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [subfields, setSubfields] = useState(
    (field?.config?.subfields || []).map((subfield) => ({
      ...subfield,
      config: subfield.config || {},
    })),
  );
  const editing = Boolean(field);
  const form = useForm({
    initialValues: {
      label: field?.label || "",
      key: field?.key || "",
      type: field?.type || "text",
      required: field?.required || false,
      sort_order: field?.sort_order || 0,
      options: (field?.config?.options || []).join("\n"),
    },
    validate: {
      label: (value) => (value.trim().length > 0 ? null : "Enter a field label"),
      key: (value) => (value.trim().length > 0 ? null : "Enter a field key"),
    },
  });

  const addSubfield = () => {
    setSubfields([
      ...subfields,
      {
        label: "",
        key: "",
        type: "text",
        required: false,
        config: {},
      },
    ]);
  };

  const updateSubfield = (index, key, value) => {
    setSubfields(
      subfields.map((subfield, subfieldIndex) =>
        subfieldIndex === index
          ? {
              ...subfield,
              [key]: value,
            }
          : subfield,
      ),
    );
  };

  const removeSubfield = (index) => {
    setSubfields(subfields.filter((_, subfieldIndex) => subfieldIndex !== index));
  };

  const submit = async (values) => {
    setLoading(true);

    try {
      const config = {};

      if (values.type === "select") {
        config.options = values.options
          .split("\n")
          .map((option) => option.trim())
          .filter(Boolean);
      }

      if (values.type === "repeater") {
        config.subfields = subfields
          .filter((subfield) => subfield.label && subfield.key)
          .map((subfield) => ({
            label: subfield.label,
            key: subfield.key,
            type: subfield.type,
            required: Boolean(subfield.required),
            config:
              subfield.type === "select"
                ? {
                    options: Array.isArray(subfield.config?.options)
                      ? subfield.config.options
                      : [],
                  }
                : subfield.config || {},
          }));
      }

      const body = {
        label: values.label,
        key: values.key,
        type: values.type,
        required: values.required,
        sort_order: values.sort_order,
        config,
      };
      const response = await fetch(editing ? `/api/fields/${field.id}` : "/api/fields", {
        method: editing ? "PATCH" : "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(editing ? body : { ...body, section_id: sectionId }),
      });
      const payload = await response.json();

      if (!response.ok) {
        applyApiFieldErrors(form, payload.details);
        notifications.show({
          color: "red",
          title: editing ? "Field was not updated" : "Field was not created",
          message: getApiErrorMessage(payload, "Check the field details."),
        });
        return;
      }

      notifications.show({
        color: "green",
        title: editing ? "Field updated" : "Field created",
        message: "The page structure has been updated.",
      });
      modals.closeAll();
      router.refresh();
    } catch {
      notifications.show({
        color: "red",
        title: "Network error",
        message: "The field request could not be completed.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.onSubmit(submit)}>
      <Stack gap="md">
        <TextInput label="Label" placeholder="Hero title" {...form.getInputProps("label")} />
        <TextInput
          label="Key"
          description="Used by the website API to find this field."
          placeholder="hero-title"
          value={form.values.key}
          error={form.errors.key}
          onChange={(event) =>
            form.setFieldValue("key", formatKeyInput(event.currentTarget.value))
          }
        />
        <Select label="Type" data={fieldTypeOptions} {...form.getInputProps("type")} />
        <NumberInput label="Order on the page" min={0} {...form.getInputProps("sort_order")} />
        <Checkbox label="Required" {...form.getInputProps("required", { type: "checkbox" })} />
        {form.values.type === "select" ? (
          <Textarea
            label="Options"
            description="One option per line"
            autosize
            minRows={4}
            {...form.getInputProps("options")}
          />
        ) : null}
        {form.values.type === "repeater" ? (
          <Stack gap="sm">
            <Group justify="space-between">
              <Text fw={700}>Fields in each item</Text>
              <Button variant="default" onClick={addSubfield}>
                Add a field
              </Button>
            </Group>
            {subfields.map((subfield, index) => (
              <Paper key={index} p="md" className="field-surface">
                <Stack gap="sm">
                  <Group justify="space-between">
                    <Text fw={700}>Field {index + 1}</Text>
                    <ActionIcon color="red" variant="subtle" onClick={() => removeSubfield(index)}>
                      <LuTrash2 size={16} />
                    </ActionIcon>
                  </Group>
                  <TextInput
                    label="Label"
                    value={subfield.label}
                    onChange={(event) => updateSubfield(index, "label", event.currentTarget.value)}
                  />
                  <TextInput
                    label="Key"
                    value={subfield.key}
                    onChange={(event) =>
                      updateSubfield(index, "key", formatKeyInput(event.currentTarget.value))
                    }
                  />
                  <Select
                    label="Type"
                    data={repeaterTypeOptions}
                    value={subfield.type}
                    onChange={(value) => updateSubfield(index, "type", value)}
                  />
                  {subfield.type === "select" ? (
                    <Textarea
                      label="Options"
                      description="One option per line"
                      autosize
                      minRows={3}
                      value={(subfield.config?.options || []).join("\n")}
                      onChange={(event) =>
                        updateSubfield(index, "config", {
                          ...subfield.config,
                          options: event.currentTarget.value
                            .split("\n")
                            .map((option) => option.trim())
                            .filter(Boolean),
                        })
                      }
                    />
                  ) : null}
                  <Checkbox
                    label="Required"
                    checked={Boolean(subfield.required)}
                    onChange={(event) =>
                      updateSubfield(index, "required", event.currentTarget.checked)
                    }
                  />
                </Stack>
              </Paper>
            ))}
          </Stack>
        ) : null}
        <Group justify="flex-end">
          <Button variant="subtle" onClick={() => modals.closeAll()}>
            Cancel
          </Button>
          <Button type="submit" loading={loading}>
            {editing ? "Save field" : "Create field"}
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
