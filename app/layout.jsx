import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dropzone/styles.css";
import "@mantine/tiptap/styles.css";
import "./global.css";
import React from "react";
import { ColorSchemeScript, mantineHtmlProps } from "@mantine/core";
import ClientLayout from "./ClientLayout";
import Navbar from "./components/Navbar";

export const metadata = {
  title: "CMS",
  description: "A central CMS for managing content across customer websites.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" {...mantineHtmlProps}>
      <head>
        <ColorSchemeScript />
        <link rel="shortcut icon" href="/favicon.svg" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body>
        <ClientLayout navbar={<Navbar />}>{children}</ClientLayout>
      </body>
    </html>
  );
}
