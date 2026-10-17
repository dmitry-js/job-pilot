import { FeatureSection } from "@/components/homepage/FeatureSection";

export function Features(): React.JSX.Element {
  return (
    <>
      <FeatureSection id="manage-job-search" title="Manage Your Job Search With Ease" highlightedIndex={0}
        features={[
          { title: "Find jobs that actually fit", description: "Search by title and location or paste a job link. Get matched roles you can quickly scan." },
          { title: "Know the Company Before You Apply", description: "Stop guessing what a company is about. JobPilot browses their site and gives you everything you need to apply with confidence." },
          { title: "Keep track of every application", description: "Keep a clear view of every job you’ve found, tailored. Your activity and progress all stay in one simple place." },
        ]}
        image={{ src: "/images/jobs-lists.png", width: 2364, height: 1778, alt: "Example job matches for Vercel, Stripe, Linear, Notion, OpenAI, and Figma, with match scores and salary estimates." }}
      />
      <div aria-hidden="true" className="landing-divider" />
      <FeatureSection id="apply-with-confidence" title="Apply With More Confidence, Every Time" reverse highlightedIndex={1}
        features={[
          { title: "Understand your match score", description: "See how your profile lines up with each role before you apply. Get a clear breakdown of what fits and what’s missing." },
          { title: "AI-Powered Job Matching", description: "Stop guessing which jobs are worth applying to. JobPilot scores every role against your actual skills so you focus on the ones that matter." },
          { title: "Focus on the right roles", description: "Filter out low fit jobs and stay on the ones that actually matter. Spend less time sorting and more time applying." },
        ]}
        image={{ src: "/images/agnet-log.png", width: 2144, height: 1656, alt: "Illustrative JobPilot agent log showing matching roles and preparing application materials." }}
      />
      <div aria-hidden="true" className="landing-divider" />
    </>
  );
}
