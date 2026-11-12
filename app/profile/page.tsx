import { AppShell } from "@/components/layout/AppShell";
import { requireUser } from "@/lib/auth";

export default async function ProfilePage(): Promise<React.JSX.Element> {
  const user = await requireUser();
  return <AppShell title="Your profile" description="Profile setup is coming next. You’ll be able to add your experience, resume, and job preferences here." email={user.email} activePath="/profile" />;
}
