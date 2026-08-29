"use client";

import { Button } from "@mantine/core";
import NextLink from "next/link";

export default function LinkButton({ href, children, ...props }) {
  return (
    <Button {...props} component={NextLink} href={href}>
      {children}
    </Button>
  );
}
