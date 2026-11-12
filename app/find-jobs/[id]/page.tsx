import { AppShell } from "@/components/layout/AppShell";
import { requireUser } from "@/lib/auth";

export default async function JobDetailsPage(): Promise<React.JSX.Element> {
  const user = await requireUser();
  return <AppShell title="Job details" description="Job details aren’t available yet. Once job discovery is ready, you’ll see the role, match information, and company research here." email={user.email} activePath="/find-jobs" />;
}
