"use client";

import { Select } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function WebsiteSwitcher({ websites, activeWebsite }) {
  const router = useRouter();
  const [value, setValue] = useState(activeWebsite?.id || "");

  const switchWebsite = async (websiteId) => {
    if (!websiteId || websiteId === value) {
      return;
    }

    setValue(websiteId);

    const response = await fetch("/api/active-website", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ website_id: websiteId }),
    });
    const payload = await response.json();

    if (!response.ok) {
      notifications.show({
        color: "red",
        title: "Could not switch website",
        message: payload.error || "Try again.",
      });
      return;
    }

    router.push("/dashboard");
    router.refresh();
  };

  return (
    <Select
      label="Active website"
      value={value}
      data={websites.map((website) => ({
        value: website.id,
        label: website.name,
      }))}
      placeholder="Choose website"
      searchable
      allowDeselect={false}
      onChange={switchWebsite}
      nothingFoundMessage="No websites"
    />
  );
}
