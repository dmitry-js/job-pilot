import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Hero } from "@/components/homepage/Hero";
import { DashboardPreview } from "@/components/homepage/DashboardPreview";
import { Features } from "@/components/homepage/Features";
import { Testimonial } from "@/components/homepage/Testimonial";
import { ClosingCta } from "@/components/homepage/ClosingCta";

export default function Home(): React.JSX.Element {
  return (
    <>
      <a href="#main-content" className="sr-only focus:not-sr-only focus:block focus:p-4">Skip to content</a>
      <Navbar />
      <main id="main-content" className="mx-auto mt-8 max-w-7xl border-x border-t border-border sm:mt-15 max-[1328px]:mx-6 max-sm:mx-4">
        <Hero />
        <DashboardPreview />
        <div aria-hidden="true" className="h-10 border-y border-border sm:h-18" />
        <Features />
        <Testimonial />
        <ClosingCta />
      </main>
      <Footer />
    </>
  );
}
