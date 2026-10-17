import Image from "next/image";

export function Testimonial(): React.JSX.Element {
  return (
    <section aria-labelledby="success-stories" className="px-6 py-15 text-center sm:px-20 sm:py-16">
      <h2 id="success-stories" className="text-xs font-medium tracking-widest text-accent-dark">SUCCESS STORIES</h2>
      <figure className="mx-auto mt-6 max-w-230">
        <blockquote className="text-xl leading-[1.45] font-medium tracking-[-0.02em] text-text-darker sm:text-[32px]">
          “I used to spend my evenings copy-pasting resumes. Now I open my dashboard to see interviews waiting. It feels like cheating. Had 3 offers on the table simultaneously.”
        </blockquote>
        <figcaption className="mt-6 flex items-center justify-center gap-3 text-left">
          <Image src="/images/user-icon.png" width={48} height={48} alt="" className="rounded-md" />
          <div>
            <p className="text-sm font-semibold text-text-black">Tom Wilson</p>
            <p className="mt-1 text-sm text-text-secondary">Junior Developer</p>
          </div>
        </figcaption>
      </figure>
    </section>
  );
}
