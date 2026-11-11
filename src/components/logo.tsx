import Link from "next/link";
import { RecycleIcon } from "./icons";

/** Text logo. Replace the mark with your real logo (e.g. an <Image> of /logo.svg) when you have it. */
export default function Logo() {
  return (
    <Link href="/" className="brand" aria-label="WEEE Centre — home">
      <span className="brand__mark">
        <RecycleIcon size={22} />
      </span>
      <span className="brand__text">
        WEEE Centre
        <small>Responsible e-waste management</small>
      </span>
    </Link>
  );
}
