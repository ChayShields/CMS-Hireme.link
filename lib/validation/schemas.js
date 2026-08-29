import { z } from "zod";
import { sanitizeKey, slugify, stripText } from "../sanitize";

export const fieldTypes = [
  "text",
  "textarea",
  "number",
  "image",
  "link",
  "boolean",
  "select",
  "richtext",
  "repeater",
];

export const idSchema = (message = "Invalid id") =>
  z
    .string({ error: message })
    .regex(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
      message,
    );

const keySchema = z
  .string()
  .min(1, "Key is required")
  .transform((value) => sanitizeKey(value))
  .refine((value) => value.length > 0, "Key must contain letters or numbers");

const slugSchema = z
  .string()
  .min(1, "Slug is required")
  .transform((value) => slugify(value))
  .refine((value) => value.length > 0, "Slug must contain letters or numbers");

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email address").transform(stripText),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const websiteSchema = z.object({
  name: z.string().min(2, "Website name is required").transform(stripText),
  domain: z.string().min(2, "Domain is required").transform(stripText),
  logo_url: z.string().optional().default("").transform(stripText),
});

export const userSchema = z.object({
  email: z.string().email("Enter a valid email address").transform(stripText),
  password: z.string().min(6, "Password must be at least 6 characters"),
  full_name: z.string().min(2, "Name is required").transform(stripText),
  website_id: idSchema("Choose a website"),
});

export const userLookupSchema = z.object({
  email: z.string().email("Enter a valid email address").transform(stripText),
});

export const resetPasswordSchema = z.object({
  password: z.string().min(6, "Password must be at least 6 characters"),
});

export const pageSchema = z.object({
  website_id: idSchema("Choose a website").optional(),
  title: z.string().min(2, "Page title is required").transform(stripText),
  slug: slugSchema,
  sort_order: z.coerce.number().int().min(0).default(0),
});

export const sectionSchema = z.object({
  page_id: idSchema("Choose a page"),
  name: z.string().min(2, "Section name is required").transform(stripText),
  key: keySchema,
  sort_order: z.coerce.number().int().min(0).default(0),
});

const subfieldSchema = z.object({
  label: z.string().min(1, "Subfield label is required").transform(stripText),
  key: keySchema,
  type: z.enum(fieldTypes.filter((type) => type !== "repeater")),
  required: z.coerce.boolean().default(false),
  config: z.record(z.string(), z.any()).default({}),
});

export const fieldSchema = z.object({
  section_id: idSchema("Choose a section"),
  label: z.string().min(1, "Field label is required").transform(stripText),
  key: keySchema,
  type: z.enum(fieldTypes),
  required: z.coerce.boolean().default(false),
  sort_order: z.coerce.number().int().min(0).default(0),
  config: z
    .object({
      options: z.array(z.string().transform(stripText)).optional(),
      subfields: z.array(subfieldSchema).optional(),
    })
    .default({}),
});

export const valuesSchema = z.object({
  website_id: idSchema("Choose a website").optional(),
  values: z
    .array(
      z.object({
        field_id: idSchema("Choose a field"),
        value: z.any(),
      }),
    )
    .min(1, "Add at least one value to save"),
});

export const deleteSchema = z.object({
  id: idSchema(),
});
