import { AnalyticsIdentity } from "@/components/analytics/AnalyticsIdentity";
import Link from "next/link";
import { redirect } from "next/navigation";
import { LoginPanel } from "@/components/auth/LoginPanel";
import { signIn } from "@/actions/auth";
import { getCurrentUser } from "@/lib/auth";
import { isOAuthConfigured } from "@/lib/auth-config";
import { Brand } from "@/components/layout/Brand";

type Props = { searchParams: Promise<{ error?: string }> };

export default async function LoginPage({ searchParams }: Props): Promise<React.JSX.Element> {
  if (await getCurrentUser()) redirect("/dashboard");
  const { error } = await searchParams;
  return (
    <div className="min-h-screen bg-background">
      <AnalyticsIdentity userId={null} />
      <header className="border-b border-border bg-surface"><div className="mx-auto flex min-h-16 max-w-360 items-center justify-between gap-4 px-6"><Brand /><Link href="/" className="text-sm font-medium text-text-secondary hover:text-accent">Back to home</Link></div></header>
      <main className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-12 sm:px-8 sm:py-20 lg:grid-cols-2 lg:gap-20">
        <section aria-labelledby="intro-heading">
          <p className="text-xs font-medium tracking-widest text-accent-dark">LESS BUSYWORK. MORE POSSIBILITY.</p>
          <h2 id="intro-heading" className="mt-5 text-4xl leading-tight font-semibold tracking-tight text-text-primary sm:text-5xl">A clearer path to your next role.</h2>
          <p className="mt-6 max-w-md text-base leading-7 text-text-secondary">Bring your experience. JobPilot helps you find the opportunities worth your time.</p>
          <ol className="mt-8 space-y-5">
            {["Build your profile once", "Discover roles that match your skills", "Research companies before you apply"].map((step, index) => <li key={step} className="flex items-center gap-4 text-sm font-medium text-text-dark"><span aria-hidden="true" className="flex size-9 shrink-0 items-center justify-center rounded-full bg-accent-light text-accent-dark">{index + 1}</span>{step}</li>)}
          </ol>
        </section>
        <LoginPanel action={signIn} configured={isOAuthConfigured()} initialError={error ? "Sign in didn’t complete. Please try again with Google or GitHub." : undefined} />
      </main>
    </div>
  );
}
