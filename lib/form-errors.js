export function getApiErrorMessage(payload, fallback = "Something went wrong.") {
  if (Array.isArray(payload?.details) && payload.details.length > 0) {
    return payload.details
      .map((detail) => detail.message)
      .filter(Boolean)
      .join(" ");
  }

  return payload?.error || fallback;
}

export function applyApiFieldErrors(form, details) {
  if (!form || !Array.isArray(details) || details.length === 0) {
    return false;
  }

  const values = form.getValues();
  const errors = {};

  details.forEach((detail) => {
    if (!detail?.field || !detail?.message) {
      return;
    }

    const path = detail.field.split(".");
    const topLevel = path[0];

    if (Object.prototype.hasOwnProperty.call(values, detail.field)) {
      errors[detail.field] = detail.message;
      return;
    }

    if (Object.prototype.hasOwnProperty.call(values, topLevel)) {
      errors[topLevel] = detail.message;
      return;
    }

    if (topLevel === "config" && Object.prototype.hasOwnProperty.call(values, "options")) {
      errors.options = detail.message;
      return;
    }

    if (topLevel === "config" && Object.prototype.hasOwnProperty.call(values, "type")) {
      errors.type = detail.message;
    }
  });

  if (Object.keys(errors).length === 0) {
    return false;
  }

  form.setErrors(errors);
  return true;
}
