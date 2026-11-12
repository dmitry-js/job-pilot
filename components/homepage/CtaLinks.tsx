import Link from "next/link";

type Props = { authenticated?: boolean };

export function CtaLinks({ authenticated = false }: Props): React.JSX.Element {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <Link href={authenticated ? "/dashboard" : "/login"} className="landing-button-primary px-6">
        Get Started <span aria-hidden="true" className="ml-1 text-xs text-surface/70">▶</span>
      </Link>
      <Link href={authenticated ? "/find-jobs" : "/login"} className="landing-button-secondary px-6">Find Your First Match</Link>
    </div>
  );
}
