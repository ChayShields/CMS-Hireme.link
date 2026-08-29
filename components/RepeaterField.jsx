"use client";

import {
  Accordion,
  AccordionControl,
  AccordionItem,
  AccordionPanel,
  Button,
  Group,
  NumberInput,
  Select,
  Stack,
  Switch,
  Text,
  TextInput,
} from "@mantine/core";
import { LuTrash2 } from "react-icons/lu";
import ImageFieldInput from "./ImageFieldInput";
import RichTextFieldInput from "./RichTextFieldInput";

export default function RepeaterField({ field, value, onChange }) {
  const rows = Array.isArray(value) ? value : [];
  const subfields = field.config?.subfields || [];
  const noun = rowNoun(field.label);

  const addRow = () => {
    const nextRow = subfields.reduce((result, subfield) => {
      result[subfield.key] = getDefaultValue(subfield.type);
      return result;
    }, {});

    onChange([...rows, nextRow]);
  };

  const updateRow = (index, key, nextValue) => {
    onChange(
      rows.map((row, rowIndex) =>
        rowIndex === index
          ? {
              ...row,
              [key]: nextValue,
            }
          : row,
      ),
    );
  };

  const removeRow = (index) => {
    onChange(rows.filter((_, rowIndex) => rowIndex !== index));
  };

  return (
    <Stack gap="sm">
      {rows.length > 0 ? (
        <Accordion multiple defaultValue={[]} variant="separated" radius={8}>
          {rows.map((row, index) => (
            <AccordionItem key={index} value={`item-${index}`}>
              <AccordionControl>
                <Text fw={600} lineClamp={2}>
                  {getRowPreview(row, subfields, noun)}
                </Text>
              </AccordionControl>
              <AccordionPanel>
                <Stack gap="sm">
                  <Group justify="flex-end">
                    <Button
                      color="red"
                      variant="default"
                      size="compact-sm"
                      leftSection={<LuTrash2 size={15} />}
                      onClick={() => removeRow(index)}
                    >
                      Remove {noun}
                    </Button>
                  </Group>
                  {subfields.map((subfield) => (
                    <SubfieldInput
                      key={subfield.key}
                      parentField={field}
                      subfield={subfield}
                      value={row?.[subfield.key]}
                      onChange={(nextValue) => updateRow(index, subfield.key, nextValue)}
                    />
                  ))}
                </Stack>
              </AccordionPanel>
            </AccordionItem>
          ))}
        </Accordion>
      ) : (
        <Text c="var(--cms-secondary)" fz="sm">
          Nothing in this list yet. Add {indefinite(noun)} to get started.
        </Text>
      )}
      <Button variant="default" onClick={addRow} w="fit-content">
        Add {noun}
      </Button>
    </Stack>
  );
}

function SubfieldInput({ parentField, subfield, value, onChange }) {
  const field = {
    id: parentField.id,
    label: subfield.label,
    type: subfield.type,
    config: subfield.config || {},
  };

  if (subfield.type === "richtext" || subfield.type === "textarea") {
    return <RichTextFieldInput field={field} value={value} onChange={onChange} />;
  }

  if (subfield.type === "image") {
    return <ImageFieldInput field={field} value={value} onChange={onChange} />;
  }

  if (subfield.type === "number") {
    return <NumberInput label={subfield.label} value={value ?? ""} onChange={onChange} />;
  }

  if (subfield.type === "boolean") {
    return (
      <Switch
        label={subfield.label}
        checked={Boolean(value)}
        onChange={(event) => onChange(event.currentTarget.checked)}
      />
    );
  }

  if (subfield.type === "select") {
    return (
      <Select
        label={subfield.label}
        value={value || ""}
        data={subfield.config?.options || []}
        onChange={(nextValue) => onChange(nextValue || "")}
        searchable
        clearable
      />
    );
  }

  if (subfield.type === "link") {
    return (
      <Stack gap="xs">
        <Text fw={600} fz="sm">
          {subfield.label}
        </Text>
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

  return (
    <TextInput
      label={subfield.label}
      value={value || ""}
      onChange={(event) => onChange(event.currentTarget.value)}
    />
  );
}

function getRowPreview(row, subfields, noun) {
  const titleField = pickTitleSubfield(subfields);
  const title = titleField
    ? formatPreviewValue(row?.[titleField.key], titleField.type)
    : "";
  const hasImage = subfields.some((subfield) => subfield.type === "image" && row?.[subfield.key]);
  const flags = subfields
    .filter((subfield) => subfield.type === "boolean" && row?.[subfield.key])
    .map((subfield) => subfield.label);

  const parts = [];

  if (title) {
    parts.push(title);
  } else if (hasImage) {
    parts.push(capitalise(noun === "item" ? "photo" : noun));
  }

  parts.push(...flags);

  if (parts.length === 0) {
    return `New ${noun} — click to edit`;
  }

  return parts.join(" · ");
}

function pickTitleSubfield(subfields) {
  const preferred = ["title", "name", "label", "item", "heading", "text", "full_title"];

  for (const key of preferred) {
    const match = subfields.find(
      (subfield) =>
        subfield.key === key &&
        !["boolean", "image", "number"].includes(subfield.type),
    );

    if (match) {
      return match;
    }
  }

  return subfields.find((subfield) =>
    ["text", "textarea", "select", "richtext", "link"].includes(subfield.type),
  );
}

function formatPreviewValue(value, type) {
  if (type === "link") {
    return String(value?.text || value?.url || "").trim();
  }

  if (type === "richtext" || type === "textarea") {
    return stripHtml(String(value || "")).trim();
  }

  return String(value || "").trim();
}

function rowNoun(label) {
  const text = String(label || "").toLowerCase();

  if (text.includes("photo")) return "photo";
  if (text.includes("plan")) return "plan";
  if (text.includes("link")) return "link";
  if (text.includes("review")) return "review";
  if (text.includes("space")) return "space";
  if (text.includes("detail")) return "detail";
  if (text.includes("item")) return "item";

  return "item";
}

function indefinite(noun) {
  return /^[aeiou]/.test(noun) ? `an ${noun}` : `a ${noun}`;
}

function capitalise(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function stripHtml(value) {
  return value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ");
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

  return "";
}
