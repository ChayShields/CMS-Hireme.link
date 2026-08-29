export function serializePageContent(bundle) {
  const content = bundle.sections.reduce((result, section) => {
    result[section.key] = section.fields.reduce((fields, field) => {
      fields[field.key] = bundle.values[field.id] ?? getDefaultPublicValue(field.type);
      return fields;
    }, {});

    return result;
  }, {});

  return {
    page: {
      title: bundle.page.title,
      slug: bundle.page.slug,
    },
    content,
  };
}

function getDefaultPublicValue(type) {
  if (type === "number") {
    return null;
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
