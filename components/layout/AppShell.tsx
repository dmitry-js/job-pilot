import Link from "next/link";
import { Brand } from "@/components/layout/Brand";
import { SignOutButton } from "@/components/auth/SignOutButton";

type Props = {
  title: string;
  description: string;
  email: string;
  activePath: string;
};

export function AppShell({ title, description, email, activePath }: Props): React.JSX.Element {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-surface">
        <div className="mx-auto flex min-h-16 max-w-360 flex-wrap items-center justify-between gap-4 px-6 py-3">
          <Brand />
          <nav aria-label="Main navigation" className="order-3 flex w-full justify-center gap-6 sm:order-0 sm:w-auto">
            {[["/dashboard", "Dashboard"], ["/find-jobs", "Find Jobs"], ["/profile", "Profile"]].map(([href, label]) => (
              <Link key={href} href={href} aria-current={activePath === href ? "page" : undefined} className={`inline-flex min-h-11 items-center text-sm font-medium hover:text-accent ${activePath === href ? "text-accent" : "text-text-dark"}`}>{label}</Link>
            ))}
          </nav>
          <SignOutButton />
        </div>
      </header>
      <main className="mx-auto max-w-360 p-6 sm:p-8">
        <section className="rounded-2xl border border-border bg-surface p-6 shadow-sm">
          <p className="text-xs text-text-secondary">Signed in as {email}</p>
          <h1 className="mt-3 text-2xl font-semibold text-text-primary">{title}</h1>
          <p className="mt-4 max-w-xl text-sm leading-6 text-text-secondary">{description}</p>
          <Link href="/" className="mt-6 inline-flex min-h-11 items-center rounded-md bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-dark">Back to home</Link>
        </section>
      </main>
    </div>
  );
}
