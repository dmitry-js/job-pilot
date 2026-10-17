import Link from "next/link";
import { Brand } from "@/components/layout/Brand";

export function Footer(): React.JSX.Element {
  return (
    <footer className="mx-auto flex min-h-34 max-w-7xl flex-col items-center justify-between gap-5 border-x border-border px-6 py-8 sm:flex-row sm:px-10 max-[1328px]:mx-6 max-sm:mx-4">
      <Brand />
      <nav aria-label="Footer navigation" className="flex flex-wrap justify-center gap-x-8 text-sm text-text-darker">
        <Link href="/dashboard" className="landing-nav-link">Dashboard</Link>
        <Link href="/privacy" className="landing-nav-link">Privacy Policy</Link>
        <Link href="/terms" className="landing-nav-link">Terms &amp; Condition</Link>
      </nav>
    </footer>
  );
}
