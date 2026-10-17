import Image from "next/image";

export function DashboardPreview(): React.JSX.Element {
  return (
    <section aria-label="JobPilot dashboard preview" className="border-t border-border bg-surface-tertiary/60 px-3 py-6 sm:px-10 sm:py-8">
      <Image src="/images/dashboard-demo.png" width={4788} height={2416} sizes="(max-width: 640px) 95vw, (max-width: 1328px) 90vw, 1200px" alt="JobPilot dashboard with job search statistics, recent activity, and a company research activity chart." loading="eager" className="h-auto w-full" />
    </section>
  );
}
