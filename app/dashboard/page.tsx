import { AppShell } from "@/components/layout/AppShell";
import { requireUser } from "@/lib/auth";

export default async function DashboardPage(): Promise<React.JSX.Element> {
  const user = await requireUser();
  return <AppShell title="You’re signed in" description="Welcome to JobPilot. Your account is ready. Your dashboard and job search tools are coming next." email={user.email} activePath="/dashboard" />;
}
