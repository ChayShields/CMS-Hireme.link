"use client";

import { Button, PasswordInput, Stack, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { applyApiFieldErrors, getApiErrorMessage } from "../lib/form-errors";

export default function LoginForm() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const form = useForm({
    initialValues: {
      email: "",
      password: "",
    },
    validate: {
      email: (value) =>
        /^\S+@\S+\.\S+$/.test(value) ? null : "Enter a valid email address",
      password: (value) =>
        value.length >= 6 ? null : "Password must be at least 6 characters",
    },
  });

  const handleSubmit = async (values) => {
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      const payload = await response.json();

      if (!response.ok) {
        applyApiFieldErrors(form, payload.details);
        notifications.show({
          color: "red",
          title: "Could not log in",
          message: getApiErrorMessage(payload, "Check your details and try again."),
        });
        return;
      }

      notifications.show({
        color: "green",
        title: "Logged in",
        message: "Opening your dashboard.",
      });
      router.push("/dashboard");
      router.refresh();
    } catch {
      notifications.show({
        color: "red",
        title: "Network error",
        message: "The login request could not be sent.",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      <Stack gap="md">
        <TextInput
          label="Email"
          placeholder="you@example.com"
          type="email"
          autoComplete="email"
          {...form.getInputProps("email")}
        />
        <PasswordInput
          label="Password"
          placeholder="Password"
          autoComplete="current-password"
          {...form.getInputProps("password")}
        />
        <Button type="submit" loading={loading}>
          Log in
        </Button>
      </Stack>
    </form>
  );
}
