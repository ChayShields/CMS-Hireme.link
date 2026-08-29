import { sanitizeRichText, sanitizeUrl, stripText } from "../sanitize";

export function normaliseFieldValue(field, value) {
  if (field.required && isEmptyValue(value, field.type)) {
    throw new Error(`${field.label} is required.`);
  }

  if (field.type === "text") {
    return stripText(value);
  }

  if (field.type === "number") {
    if (value === "" || value === null || value === undefined) {
      return null;
    }

    const number = Number(value);

    if (Number.isNaN(number)) {
      throw new Error(`${field.label} must be a number.`);
    }

    return number;
  }

  if (field.type === "image") {
    return stripText(value);
  }

  if (field.type === "link") {
    const text = stripText(value?.text);
    const url = sanitizeUrl(value?.url);

    if (field.required && (!text || !url)) {
      throw new Error(`${field.label} needs the wording people see and a working link.`);
    }

    return { text, url };
  }

  if (field.type === "boolean") {
    return Boolean(value);
  }

  if (field.type === "select") {
    const clean = stripText(value);
    const options = field.config?.options || [];

    if (clean && options.length > 0 && !options.includes(clean)) {
      throw new Error(`${field.label} must be one of the allowed options.`);
    }

    return clean;
  }

  if (field.type === "richtext" || field.type === "textarea") {
    return sanitizeRichText(value);
  }

  if (field.type === "repeater") {
    const rows = Array.isArray(value) ? value : [];
    const subfields = field.config?.subfields || [];

    return rows.map((row) => {
      return subfields.reduce((result, subfield) => {
        result[subfield.key] = normaliseFieldValue(subfield, row?.[subfield.key]);
        return result;
      }, {});
    });
  }

  return stripText(value);
}

function isEmptyValue(value, type) {
  if (type === "boolean") {
    return false;
  }

  if (type === "number") {
    return value === "" || value === null || value === undefined;
  }

  if (type === "link") {
    return !value?.text || !value?.url;
  }

  if (type === "repeater") {
    return !Array.isArray(value) || value.length === 0;
  }

  return value === "" || value === null || value === undefined;
}
