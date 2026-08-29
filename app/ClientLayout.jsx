"use client";

import { MantineProvider } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import { usePathname } from "next/navigation";
import { theme } from "./theme/theme";

export default function ClientLayout({ children, navbar }) {
  const pathname = usePathname();
  const showNavbar = pathname === "/";

  return (
    <MantineProvider theme={theme} forceColorScheme="dark">
      <ModalsProvider
        modalProps={{
          radius: 8,
          styles: {
            body: {
              marginTop: 16,
            },
          },
        }}
      >
        <Notifications position="top-right" zIndex={4000} />
        {showNavbar ? navbar : null}
        {children}
      </ModalsProvider>
    </MantineProvider>
  );
}
