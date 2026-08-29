"use client";

import { Paper } from "@mantine/core";
import NextLink from "next/link";

export default function LinkPaper({ href, children, ...props }) {
  return (
    <Paper {...props} component={NextLink} href={href}>
      {children}
    </Paper>
  );
}
