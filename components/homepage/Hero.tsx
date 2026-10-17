import { CtaLinks } from "@/components/homepage/CtaLinks";

export function Hero(): React.JSX.Element {
  return (
    <section aria-labelledby="hero-title" className="landing-glow flex min-h-104 flex-col items-center justify-center px-5 py-14 text-center sm:px-10">
      <h1 id="hero-title" className="max-w-4xl text-4xl leading-[1.08] font-bold tracking-[-0.055em] text-text-slate sm:text-[64px]">
        Job hunting is hard.<br />Your tools shouldn’t be.
      </h1>
      <p className="mt-6 mb-6 max-w-160 text-base leading-7 text-text-secondary sm:text-lg">
        Stop applying blind. JobPilot finds the jobs, researches the companies, and gives you everything you need to stand out.
      </p>
      <CtaLinks />
    </section>
  );
}
