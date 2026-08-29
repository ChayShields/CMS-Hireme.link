import { createTheme } from "@mantine/core";

export const palette = {
  primary: "#E8A34A",
  secondary: "#A3A3A3",
  background: "#0A0A0A",
  secondaryBackground: "#141414",
  border: "#262626",
  text: "#F5F5F5",
};

export const theme = createTheme({
  primaryColor: "cmsPrimary",
  primaryShade: 5,
  fontFamily:
    "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
  headings: {
    fontFamily:
      "Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif",
    fontWeight: "650",
  },
  defaultRadius: 8,
  radius: {
    xs: 8,
    sm: 8,
    md: 8,
    lg: 8,
    xl: 8,
  },
  colors: {
    cmsPrimary: [
      "#FFF8EB",
      "#FFE9C4",
      "#FDD79A",
      "#F7C372",
      "#F0B158",
      "#E8A34A",
      "#D18E38",
      "#B4742B",
      "#8F5A22",
      "#6A4219",
    ],
    cmsDark: [
      "#F5F5F5",
      "#D4D4D4",
      "#A3A3A3",
      "#737373",
      "#525252",
      "#404040",
      "#262626",
      "#1C1C1C",
      "#141414",
      "#0A0A0A",
    ],
  },
  components: {
    Button: {
      defaultProps: {
        radius: 8,
        color: "cmsPrimary",
        autoContrast: true,
      },
    },
    ActionIcon: {
      defaultProps: {
        radius: 8,
        color: "cmsPrimary",
      },
    },
    Paper: {
      defaultProps: {
        radius: 8,
        bg: palette.secondaryBackground,
        bd: `1px solid ${palette.border}`,
      },
    },
    TextInput: {
      defaultProps: {
        radius: 8,
      },
    },
    Textarea: {
      defaultProps: {
        radius: 8,
      },
    },
    PasswordInput: {
      defaultProps: {
        radius: 8,
      },
    },
    Select: {
      defaultProps: {
        radius: 8,
      },
    },
    NumberInput: {
      defaultProps: {
        radius: 8,
      },
    },
    Checkbox: {
      defaultProps: {
        radius: 8,
        color: "cmsPrimary",
      },
    },
    Switch: {
      defaultProps: {
        color: "cmsPrimary",
      },
    },
    Dropzone: {
      defaultProps: {
        radius: 8,
      },
    },
    Image: {
      defaultProps: {
        radius: 8,
      },
    },
    Modal: {
      defaultProps: {
        radius: 8,
      },
      styles: {
        body: {
          marginTop: 16,
        },
      },
    },
  },
});
