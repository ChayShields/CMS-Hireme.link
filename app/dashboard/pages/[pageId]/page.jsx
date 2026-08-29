import { notFound } from "next/navigation";
import PageEditor from "../../../../components/PageEditor";
import { requireSession } from "../../../../lib/auth/require";
import { getPageBundle } from "../../../../lib/data/content";
import { getWebsiteIdForPage } from "../../../../lib/data/mutations";

export const dynamic = "force-dynamic";

export default async function EditPage({ params }) {
  const { pageId } = await params;
  const { profile } = await requireSession();
  const websiteId =
    profile.role === "customer"
      ? profile.website_id
      : await getWebsiteIdForPage(pageId);

  if (!websiteId) {
    notFound();
  }

  const bundle = await getPageBundle(pageId, websiteId);

  if (!bundle) {
    notFound();
  }

  return (
    <PageEditor
      page={bundle.page}
      sections={bundle.sections}
      values={bundle.values}
      profile={profile}
    />
  );
}
