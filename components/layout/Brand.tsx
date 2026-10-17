import Image from "next/image";
import Link from "next/link";

export function Brand(): React.JSX.Element {
  return (
    <Link href="/" aria-label="JobPilot home" className="inline-flex min-h-11 shrink-0 items-center rounded-sm">
      <Image src="/logo.png" width={124} height={42} alt="JobPilot" className="h-auto w-31" />
    </Link>
  );
}
