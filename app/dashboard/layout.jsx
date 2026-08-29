import DashboardShell from "../../components/DashboardShell";
import { requireSession } from "../../lib/auth/require";
import {
  getPagesForWebsite,
  getWebsites,
  resolveActiveWebsite,
} from "../../lib/data/content";

export const dynamic = "force-dynamic";

export default async function DashboardLayout({ children }) {
  const { profile } = await requireSession();
  const websites = profile.role === "admin" ? await getWebsites() : [];
  const activeWebsite = await resolveActiveWebsite(profile);
  const pages = await getPagesForWebsite(activeWebsite?.id);

  return (
    <DashboardShell
      profile={profile}
      websites={websites}
      activeWebsite={activeWebsite}
      pages={pages}
    >
      {children}
    </DashboardShell>
  );
}
