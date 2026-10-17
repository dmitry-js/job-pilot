import Image from "next/image";

type Feature = { title: string; description: string };
type Props = {
  id: string;
  title: string;
  features: Feature[];
  image: { src: string; width: number; height: number; alt: string };
  reverse?: boolean;
  highlightedIndex: number;
};

export function FeatureSection({ id, title, features, image, reverse = false, highlightedIndex }: Props): React.JSX.Element {
  return (
    <section aria-labelledby={id} className="grid border-b border-border md:grid-cols-2">
      <div className={reverse ? "md:col-start-2 md:row-start-1" : ""}>
        <div className="landing-feature-heading">
          <h2 id={id} className={`text-3xl leading-[1.12] font-semibold tracking-[-0.045em] text-text-slate sm:text-[46px] ${reverse ? "" : "max-w-120"}`}>{title}</h2>
        </div>
        <ul>
          {features.map((feature: Feature, index: number) => (
            <li key={feature.title} className="border-t border-border pl-5 sm:pl-12">
              <div className={`min-h-38 border-l px-5 py-7 sm:px-6 ${index === highlightedIndex ? (reverse ? "border-success" : "border-accent") : "border-border/60"}`}>
                <h3 className="text-lg leading-6 font-semibold text-text-darker">{feature.title}</h3>
                <p className="mt-3 text-base leading-7 text-text-secondary sm:text-lg">{feature.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <figure className={`flex min-w-0 items-center justify-center border-border bg-background px-6 py-14 ${reverse ? "md:col-start-1 md:row-start-1 md:border-r md:px-13" : "md:border-l"}`}>
        <Image src={image.src} width={image.width} height={image.height} alt={image.alt} sizes="(max-width: 768px) 85vw, (max-width: 1328px) 43vw, 592px" className="h-auto w-full" />
      </figure>
    </section>
  );
}
