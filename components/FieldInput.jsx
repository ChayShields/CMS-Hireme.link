"use client";

import {
  NumberInput,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
} from "@mantine/core";
import ImageFieldInput from "./ImageFieldInput";
import RepeaterField from "./RepeaterField";
import RichTextFieldInput from "./RichTextFieldInput";

export default function FieldInput({ field, value, onChange, hideLabel = false }) {
  const label = hideLabel ? undefined : field.label;

  if (field.type === "textarea" || field.type === "richtext") {
    return (
      <RichTextFieldInput
        field={field}
        value={value}
        onChange={onChange}
        hideLabel={hideLabel}
      />
    );
  }

  if (field.type === "number") {
    return <NumberInput label={label} value={value ?? ""} onChange={onChange} />;
  }

  if (field.type === "image") {
    return (
      <ImageFieldInput
        field={field}
        value={value}
        onChange={onChange}
        hideLabel={hideLabel}
      />
    );
  }

  if (field.type === "link") {
    return (
      <Stack gap="xs">
        {hideLabel ? null : (
          <Text fw={600} fz="sm">
            {field.label}
          </Text>
        )}
        <TextInput
          label="Wording people see"
          placeholder="Join now"
          value={value?.text || ""}
          onChange={(event) => onChange({ ...value, text: event.currentTarget.value })}
        />
        <TextInput
          label="Link"
          description="A page path or web address, for example /contact"
          placeholder="/contact"
          value={value?.url || ""}
          onChange={(event) => onChange({ ...value, url: event.currentTarget.value })}
        />
      </Stack>
    );
  }

  if (field.type === "boolean") {
    return (
      <Switch
        label={hideLabel ? undefined : field.label}
        aria-label={field.label}
        checked={Boolean(value)}
        onChange={(event) => onChange(event.currentTarget.checked)}
      />
    );
  }

  if (field.type === "select") {
    return (
      <Select
        label={label}
        value={value || ""}
        data={field.config?.options || []}
        onChange={(nextValue) => onChange(nextValue || "")}
        searchable
        clearable
      />
    );
  }

  if (field.type === "repeater") {
    return <RepeaterField field={field} value={value} onChange={onChange} />;
  }

  return (
    <TextInput
      label={label}
      value={value || ""}
      onChange={(event) => onChange(event.currentTarget.value)}
    />
  );
}

