import Link from "next/link";

export function CtaLinks(): React.JSX.Element {
  return (
    <div className="flex flex-wrap items-center justify-center gap-4">
      <Link href="/login" className="landing-button-primary px-6">
        Get Started <span aria-hidden="true" className="ml-1 text-xs text-surface/70">▶</span>
      </Link>
      <Link href="/find-jobs" className="landing-button-secondary px-6">Find Your First Match</Link>
    </div>
  );
}
