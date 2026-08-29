import sanitizeHtml from "sanitize-html";

export function stripText(value) {
  if (value === null || value === undefined) {
    return "";
  }

  return sanitizeHtml(String(value), {
    allowedTags: [],
    allowedAttributes: {},
  }).trim();
}

export function sanitizeRichText(value) {
  return sanitizeHtml(String(value || ""), {
    allowedTags: [
      "p",
      "br",
      "strong",
      "em",
      "u",
      "s",
      "ul",
      "ol",
      "li",
      "blockquote",
      "h2",
      "h3",
      "h4",
      "a",
    ],
    allowedAttributes: {
      a: ["href", "target", "rel"],
    },
    allowedSchemes: ["http", "https", "mailto", "tel"],
    transformTags: {
      a: sanitizeHtml.simpleTransform("a", {
        rel: "noopener noreferrer",
        target: "_blank",
      }),
    },
  }).trim();
}

export function sanitizeUrl(value) {
  const clean = stripText(value);

  if (!clean) {
    return "";
  }

  if (clean.startsWith("/")) {
    return clean;
  }

  try {
    const url = new URL(clean);

    if (["http:", "https:", "mailto:", "tel:"].includes(url.protocol)) {
      return clean;
    }
  } catch {}

  return "";
}

export function formatSlugInput(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/-+/g, "-");
}

export function slugify(value) {
  return formatSlugInput(stripText(value)).replace(/^-+|-+$/g, "");
}

export function formatKeyInput(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9_-]+/g, "-")
    .replace(/-+/g, "-");
}

export function sanitizeKey(value) {
  return formatKeyInput(stripText(value)).replace(/^[-_]+|[-_]+$/g, "");
}
