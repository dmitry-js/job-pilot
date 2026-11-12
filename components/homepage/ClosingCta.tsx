import { CtaLinks } from "@/components/homepage/CtaLinks";

type Props = { authenticated?: boolean };

export function ClosingCta({ authenticated = false }: Props): React.JSX.Element {
  return (
    <>
      <div aria-hidden="true" className="landing-divider" />
      <section aria-labelledby="closing-title" className="landing-glow flex min-h-103 flex-col items-center justify-center px-6 py-16 text-center">
        <h2 id="closing-title" className="max-w-190 text-3xl leading-[1.08] font-semibold tracking-[-0.05em] text-text-slate sm:text-[54px]">Your next job search can feel a lot less overwhelming</h2>
        <p className="mt-7 mb-7 text-base leading-7 text-text-darker sm:text-lg">Set up your profile, upload your resume, and start finding matches in minutes.</p>
        <CtaLinks authenticated={authenticated} />
      </section>
      <div aria-hidden="true" className="landing-divider" />
    </>
  );
}
