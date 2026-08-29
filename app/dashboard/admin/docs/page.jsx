import { Code, Paper, Stack, Text, Title } from "@mantine/core";
import { requireAdmin } from "../../../../lib/auth/require";

export const dynamic = "force-dynamic";

const fetchExample = `const response = await fetch("https://your-cms.test/api/v1/pages/home", {
  headers: {
    "x-api-key": process.env.CMS_API_KEY
  },
  next: {
    revalidate: 60
  }
});

const page = await response.json();
const heroTitle = page.content.hero.hero_title;`;

const responseExample = `{
  "page": {
    "title": "Home",
    "slug": "home"
  },
  "content": {
    "hero": {
      "hero_title": "Quality local services",
      "hero_primary_button": {
        "text": "Book a visit",
        "url": "/contact"
      }
    },
    "faq": {
      "faq_items": [
        {
          "question": "Can I edit this?",
          "answer": "Yes."
        }
      ]
    }
  }
}`;

export default async function ApiDocsPage() {
  await requireAdmin();

  return (
    <Stack gap="lg" maw={980}>
      <Stack gap={4}>
        <Title order={1}>API docs</Title>
        <Text c="var(--cms-secondary)">
          Use a website API key to fetch live content by page slug.
        </Text>
      </Stack>
      <Paper p={{ base: "lg", sm: "xl" }}>
        <Stack gap="md">
          <Title order={2} fz="xl">
            Endpoint
          </Title>
          <Code block>GET /api/v1/pages/:slug</Code>
          <Text c="var(--cms-secondary)">
            Send the website API key as `x-api-key` or as a Bearer token.
          </Text>
          <Code block>{`x-api-key: cms_your_key_here
Authorization: Bearer cms_your_key_here`}</Code>
        </Stack>
      </Paper>
      <Paper p={{ base: "lg", sm: "xl" }}>
        <Stack gap="md">
          <Title order={2} fz="xl">
            Next.js usage
          </Title>
          <Code block>{fetchExample}</Code>
        </Stack>
      </Paper>
      <Paper p={{ base: "lg", sm: "xl" }}>
        <Stack gap="md">
          <Title order={2} fz="xl">
            Response shape
          </Title>
          <Text c="var(--cms-secondary)">
            Section keys become objects. Field keys become values inside those section objects.
          </Text>
          <Code block>{responseExample}</Code>
        </Stack>
      </Paper>
      <Paper p={{ base: "lg", sm: "xl" }}>
        <Stack gap="md">
          <Title order={2} fz="xl">
            Field value shapes
          </Title>
          <Text c="var(--cms-secondary)">
            Text, large text, image and rich text return strings. Number returns a number or null.
            Boolean returns true or false. Link returns an object with `text` and `url`.
            Select returns the selected string. Repeater returns an array of row objects.
          </Text>
          <Text c="var(--cms-secondary)">
            Responses include `Cache-Control: public, s-maxage=60, stale-while-revalidate=300`
            and an ETag that changes when content or structure is saved.
          </Text>
        </Stack>
      </Paper>
    </Stack>
  );
}
