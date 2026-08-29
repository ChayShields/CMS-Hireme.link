"use client";

import {
  ActionIcon,
  AppShell,
  AppShellMain,
  AppShellNavbar,
  Box,
  Burger,
  Divider,
  Group,
  Paper,
  ScrollArea,
  Stack,
  Text,
  TextInput,
  UnstyledButton,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { useDisclosure } from "@mantine/hooks";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { LuBookOpen, LuFileText, LuLogOut, LuMenu, LuPlus, LuUsers, LuX } from "react-icons/lu";
import WebsiteSwitcher from "./WebsiteSwitcher";
import PageQuickCreateForm from "./PageQuickCreateForm";

export default function DashboardShell({
  children,
  profile,
  websites,
  activeWebsite,
  pages,
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [opened, { toggle, close }] = useDisclosure(false);
  const [query, setQuery] = useState("");
  const filteredPages = pages.filter((page) =>
    page.title.toLowerCase().includes(query.toLowerCase()),
  );
  const isAdmin = profile.role === "admin";

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const openPageCreate = () => {
    if (!activeWebsite) {
      notifications.show({
        color: "red",
        title: "No website selected",
        message: "Create or choose a website before adding pages.",
      });
      return;
    }

    modals.open({
      title: "Add page",
      centered: true,
      children: <PageQuickCreateForm websiteId={activeWebsite.id} />,
    });
  };

  const nav = (
    <Stack gap="md" h="100%">
      <Group justify="space-between" hiddenFrom="sm">
        <Text fw={700} fz="lg">
          CMS
        </Text>
        <ActionIcon variant="subtle" onClick={close}>
          <LuX size={18} />
        </ActionIcon>
      </Group>
      <Paper p="md">
        <Stack gap={10}>
          <Group gap="sm" align="center">
            {activeWebsite?.logo_url ? (
              <Box
                component="img"
                src={activeWebsite.logo_url}
                alt={activeWebsite.name}
                w={42}
                h={42}
                bdrs={8}
                bd="1px solid var(--cms-border)"
                className="sidebar-logo"
              />
            ) : (
              <Box
                w={42}
                h={42}
                bg="#1C1C1C"
                bd="1px solid var(--cms-border)"
                bdrs={8}
              />
            )}
            <Box flex={1} miw={0}>
              <Text fw={700} truncate>
                {activeWebsite?.name || "No website assigned"}
              </Text>
              <Text c="var(--cms-secondary)" fz="xs" truncate>
                {activeWebsite?.domain || (isAdmin ? "Create a website to begin" : "Ask your administrator for access")}
              </Text>
            </Box>
          </Group>
          {isAdmin ? (
            <WebsiteSwitcher websites={websites} activeWebsite={activeWebsite} />
          ) : null}
        </Stack>
      </Paper>
      <Stack gap="xs">
        <Group justify="space-between">
          <Text c="var(--cms-secondary)" fz="xs" tt="uppercase" fw={700}>
            Pages
          </Text>
          {isAdmin ? (
            <ActionIcon
              variant="subtle"
              onClick={openPageCreate}
              aria-label="Add page"
            >
              <LuPlus size={16} />
            </ActionIcon>
          ) : null}
        </Group>
        <TextInput
          placeholder="Search pages"
          value={query}
          onChange={(event) => setQuery(event.currentTarget.value)}
        />
      </Stack>
      <ScrollArea flex={1} type="never">
        <Stack gap={4}>
          {filteredPages.map((page) => {
            const href = `/dashboard/pages/${page.id}`;
            const active = pathname === href;

            return (
              <Link
                key={page.id}
                href={href}
                className={active ? "sidebar-link sidebar-link-active" : "sidebar-link"}
                onClick={close}
              >
                <LuFileText size={16} />
                <Text fz="sm" truncate>
                  {page.title}
                </Text>
              </Link>
            );
          })}
          {filteredPages.length === 0 ? (
            <Text c="var(--cms-secondary)" fz="sm" px={4}>
              {query ? "No matching pages" : "No pages yet"}
            </Text>
          ) : null}
        </Stack>
      </ScrollArea>
      {isAdmin ? (
        <Stack gap={4}>
          <Divider color="var(--cms-border)" />
          <Link href="/dashboard/admin/websites" className="sidebar-link" onClick={close}>
            <LuMenu size={16} />
            <Text fz="sm">Websites</Text>
          </Link>
          <Link href="/dashboard/admin/users" className="sidebar-link" onClick={close}>
            <LuUsers size={16} />
            <Text fz="sm">Users</Text>
          </Link>
          <Link href="/dashboard/admin/docs" className="sidebar-link" onClick={close}>
            <LuBookOpen size={16} />
            <Text fz="sm">API docs</Text>
          </Link>
        </Stack>
      ) : null}
      <UnstyledButton className="sidebar-link" onClick={logout}>
        <LuLogOut size={16} />
        <Text fz="sm">Log out</Text>
      </UnstyledButton>
    </Stack>
  );

  return (
    <AppShell
      navbar={{
        width: 320,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding={{ base: "md", sm: "xl" }}
      bg="var(--cms-background)"
    >
      <AppShellNavbar p="md" bg="var(--cms-secondary-background)" bd="1px solid var(--cms-border)">
        {nav}
      </AppShellNavbar>
      <AppShellMain>
        <Group justify="space-between" mb="md" hiddenFrom="sm">
          <Burger opened={opened} onClick={toggle} aria-label="Toggle navigation" />
          <Text fw={700}>CMS</Text>
        </Group>
        <Box px={{ base: "xs", sm: "md" }} py={{ base: "sm", sm: "md" }}>
          {children}
        </Box>
      </AppShellMain>
    </AppShell>
  );
}
