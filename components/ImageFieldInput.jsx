"use client";

import { Box, Image, Stack, Text } from "@mantine/core";
import { Dropzone, MIME_TYPES } from "@mantine/dropzone";
import { notifications } from "@mantine/notifications";
import { MAX_UPLOAD_BYTES } from "../lib/media/constants";

export default function ImageFieldInput({ field, value, onChange, hideLabel = false }) {
  const upload = async (files) => {
    const file = files[0];

    if (!file) {
      return;
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      notifications.show({
        color: "red",
        title: "Image is too large",
        message: "Choose an image that is 10MB or smaller.",
      });
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("field_id", field.id);

    if (value) {
      formData.append("previous_url", value);
    }

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const payload = await response.json();

      if (!response.ok) {
        notifications.show({
          color: "red",
          title: "Image was not uploaded",
          message: payload.error || "Try another image.",
        });
        return;
      }

      onChange(payload.url);
      notifications.show({
        color: "green",
        title: "Photo uploaded",
        message: "Press Save changes to publish it on the website.",
      });
    } catch {
      notifications.show({
        color: "red",
        title: "Network error",
        message: "The image upload could not be completed.",
      });
    }
  };

  return (
    <Stack gap="sm">
      {hideLabel ? null : (
        <Text fw={600} fz="sm">
          {field.label}
        </Text>
      )}
      {value ? (
        <Box maw={320}>
          <Image src={value} alt={field.label} />
        </Box>
      ) : null}
      <Dropzone
        onDrop={upload}
        multiple={false}
        maxSize={MAX_UPLOAD_BYTES}
        accept={[
          MIME_TYPES.png,
          MIME_TYPES.jpeg,
          MIME_TYPES.gif,
          MIME_TYPES.webp,
        ]}
        className="dropzone-panel"
      >
        <Stack gap={4} align="center" py="md">
          <Text fw={700}>{value ? "Replace photo" : "Upload a photo"}</Text>
          <Text c="var(--cms-secondary)" fz="sm" ta="center">
            PNG, JPG, GIF, WebP up to 10MB
          </Text>
        </Stack>
      </Dropzone>
      {value ? (
        <Text
          component="button"
          type="button"
          c="var(--cms-danger)"
          fz="sm"
          td="underline"
          bg="transparent"
          bd="none"
          p={0}
          style={{ cursor: "pointer", textAlign: "left" }}
          onClick={() => onChange("")}
        >
          Remove photo
        </Text>
      ) : null}
    </Stack>
  );
}
