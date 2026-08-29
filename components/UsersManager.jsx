"use client";

import {
  Button,
  Group,
  Paper,
  PasswordInput,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { applyApiFieldErrors, getApiErrorMessage } from "../lib/form-errors";
import ConfirmDeleteModal from "./ConfirmDeleteModal";

export default function UsersManager({ users, websites }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [lookupLoading, setLookupLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const [foundUser, setFoundUser] = useState(null);
  const form = useForm({
    initialValues: {
      full_name: "",
      email: "",
      password: "",
      website_id: "",
    },
    validate: {
      full_name: (value) => (value.trim().length > 1 ? null : "Enter a name"),
      email: (value) => (/^\S+@\S+\.\S+$/.test(value) ? null : "Enter a valid email"),
      password: (value) =>
        value.length >= 6 ? null : "Password must be at least 6 characters",
      website_id: (value) => (value ? null : "Choose a website"),
    },
  });
  const lookupForm = useForm({
    initialValues: {
      email: "",
    },
    validate: {
      email: (value) => (/^\S+@\S+\.\S+$/.test(value) ? null : "Enter a valid email"),
    },
  });
  const resetForm = useForm({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validate: {
      password: (value) =>
        value.length >= 6 ? null : "Password must be at least 6 characters",
      confirmPassword: (value, values) =>
        value === values.password ? null : "Passwords do not match",
    },
  });

  const createUser = async (values) => {
    setLoading(true);

    try {
      const response = await fetch("/api/users", {
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
          title: "Login was not created",
          message: getApiErrorMessage(payload, "Check the login details."),
        });
        return;
      }

      form.reset();
      notifications.show({
        color: "green",
        title: "Login created",
        message: "Send the customer their email and password.",
      });
      router.refresh();
    } catch {
      notifications.show({
        color: "red",
        title: "Network error",
        message: "The login request could not be completed.",
      });
    } finally {
      setLoading(false);
    }
  };

  const lookupUser = async (values) => {
    setLookupLoading(true);
    setFoundUser(null);
    resetForm.reset();

    try {
      const response = await fetch("/api/users/lookup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      const payload = await response.json();

      if (!response.ok) {
        applyApiFieldErrors(lookupForm, payload.details);
        notifications.show({
          color: "red",
          title: "User not found",
          message: getApiErrorMessage(payload, "Check the email address."),
        });
        return;
      }

      setFoundUser(payload.profile);
    } catch {
      notifications.show({
        color: "red",
        title: "Network error",
        message: "The user could not be looked up.",
      });
    } finally {
      setLookupLoading(false);
    }
  };

  const resetPassword = async (values) => {
    if (!foundUser) {
      return;
    }

    setResetLoading(true);

    try {
      const response = await fetch(`/api/users/${foundUser.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ password: values.password }),
      });
      const payload = await response.json();

      if (!response.ok) {
        applyApiFieldErrors(resetForm, payload.details);
        notifications.show({
          color: "red",
          title: "Password was not updated",
          message: getApiErrorMessage(payload, "Try again."),
        });
        return;
      }

      resetForm.reset();
      setFoundUser(null);
      lookupForm.reset();
      notifications.show({
        color: "green",
        title: "Password updated",
        message: "Share the new password with the user securely.",
      });
    } catch {
      notifications.show({
        color: "red",
        title: "Network error",
        message: "The password could not be updated.",
      });
    } finally {
      setResetLoading(false);
    }
  };

  const deleteUser = (user) => {
    modals.open({
      title: "Delete login",
      centered: true,
      children: (
        <ConfirmDeleteModal
          title="Delete login"
          confirmLabel="Delete login"
          message={`This permanently deletes the login for ${user.full_name}.`}
          onConfirm={async () => {
            const response = await fetch(`/api/users/${user.id}`, {
              method: "DELETE",
            });
            const payload = await response.json();

            if (!response.ok) {
              notifications.show({
                color: "red",
                title: "Login was not deleted",
                message: payload.error || "Try again.",
              });
              return;
            }

            modals.closeAll();
            notifications.show({
              color: "green",
              title: "Login deleted",
              message: "The customer login has been removed.",
            });
            router.refresh();
          }}
        />
      ),
    });
  };

  const websiteOptions = websites.map((website) => ({
    value: website.id,
    label: website.name,
  }));

  return (
    <SimpleGrid cols={{ base: 1, lg: 2 }} spacing="lg">
      <Stack gap="lg">
        <Paper p={{ base: "lg", sm: "xl" }}>
          <form onSubmit={form.onSubmit(createUser)}>
            <Stack gap="md">
              <Title order={2} fz="xl">
                Create customer login
              </Title>
              <TextInput label="Name" placeholder="Jane Smith" {...form.getInputProps("full_name")} />
              <TextInput label="Email" placeholder="jane@example.com" {...form.getInputProps("email")} />
              <PasswordInput
                label="Password"
                placeholder="At least 6 characters"
                {...form.getInputProps("password")}
              />
              <Select
                label="Website"
                placeholder="Choose website"
                data={websiteOptions}
                searchable
                {...form.getInputProps("website_id")}
              />
              <Button type="submit" loading={loading}>
                Create login
              </Button>
            </Stack>
          </form>
        </Paper>
        <Paper p={{ base: "lg", sm: "xl" }}>
          <Stack gap="md">
            <Stack gap={4}>
              <Title order={2} fz="xl">
                Reset password
              </Title>
              <Text c="var(--cms-secondary)" fz="sm">
                Search for a user by email, then set a new password for them.
              </Text>
            </Stack>
            <form onSubmit={lookupForm.onSubmit(lookupUser)}>
              <Stack gap="md">
                <TextInput
                  label="Email"
                  placeholder="jane@example.com"
                  {...lookupForm.getInputProps("email")}
                />
                <Button type="submit" variant="default" loading={lookupLoading}>
                  Search user
                </Button>
              </Stack>
            </form>
            {foundUser ? (
              <form onSubmit={resetForm.onSubmit(resetPassword)}>
                <Stack gap="md">
                  <Stack gap={4}>
                    <Text fw={700}>{foundUser.full_name}</Text>
                    <Text c="var(--cms-secondary)" fz="sm">
                      {foundUser.email}
                    </Text>
                    <Text c="var(--cms-secondary)" fz="xs">
                      {foundUser.websiteName ||
                        (foundUser.role === "admin" ? "Admin" : "No website")}
                    </Text>
                  </Stack>
                  <PasswordInput
                    label="New password"
                    placeholder="At least 6 characters"
                    {...resetForm.getInputProps("password")}
                  />
                  <PasswordInput
                    label="Confirm password"
                    placeholder="Repeat the new password"
                    {...resetForm.getInputProps("confirmPassword")}
                  />
                  <Button type="submit" loading={resetLoading}>
                    Update password
                  </Button>
                </Stack>
              </form>
            ) : null}
          </Stack>
        </Paper>
      </Stack>
      <Stack gap="md">
        {users.map((user) => (
          <Paper key={user.id} p="lg">
            <Group justify="space-between" align="flex-start">
              <Stack gap={4}>
                <Title order={3} fz="lg">
                  {user.full_name}
                </Title>
                <Text c="var(--cms-secondary)" fz="sm">
                  {user.email}
                </Text>
                <Text c="var(--cms-secondary)" fz="xs">
                  {user.websiteName}
                </Text>
              </Stack>
              <Button color="red" variant="default" onClick={() => deleteUser(user)}>
                Delete
              </Button>
            </Group>
          </Paper>
        ))}
        {users.length === 0 ? (
          <Paper p="xl">
            <Stack gap="sm">
              <Title order={2}>No customer logins</Title>
              <Text c="var(--cms-secondary)">
                Create a login and assign it to a website.
              </Text>
            </Stack>
          </Paper>
        ) : null}
      </Stack>
    </SimpleGrid>
  );
}
