import Link from "next/link";
import { Navigation } from "lucide-react";
export default function Brand() {
  return (
    <Link className="brand" href="/" aria-label="F1Pilot home">
      <span className="brand-mark">
        <Navigation size={19} strokeWidth={1.5} />
      </span>
      <span>
        F1<span className="brand-light">Pilot</span>
      </span>
    </Link>
  );
}
