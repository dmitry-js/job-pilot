import { AppShell } from "@/components/layout/AppShell";
import { requireUser } from "@/lib/auth";

export default async function FindJobsPage(): Promise<React.JSX.Element> {
  const user = await requireUser();
  return <AppShell title="Find jobs" description="Job discovery is coming soon. This will be your place to find and compare roles that match your experience." email={user.email} activePath="/find-jobs" />;
}
