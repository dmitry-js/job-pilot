import Link from "next/link";
import { Brand } from "@/components/layout/Brand";

type Props = { authenticated?: boolean };

export function Navbar({ authenticated = false }: Props): React.JSX.Element {
  return (
    <header className="border-b border-border bg-surface">
      <div className="mx-auto grid min-h-20 max-w-7xl grid-cols-2 items-center gap-x-4 px-4 py-3 sm:grid-cols-[1fr_auto_1fr] sm:px-0 sm:py-0 max-[1328px]:sm:mx-6">
        <Brand />
        <nav aria-label="Main navigation" className="col-span-2 row-start-2 flex justify-center gap-8 text-sm text-text-darker sm:col-span-1 sm:col-start-2 sm:row-start-1">
          <Link className="landing-nav-link" href="/dashboard">Dashboard</Link>
          <Link className="landing-nav-link" href="/find-jobs">Find Jobs</Link>
          <Link className="landing-nav-link" href="/profile">Profile</Link>
        </nav>
        <Link href={authenticated ? "/dashboard" : "/login"} className="landing-button-primary col-start-2 row-start-1 justify-self-end px-5 text-sm sm:col-start-3">{authenticated ? "Open dashboard" : "Start for free"}</Link>
      </div>
    </header>
  );
}
