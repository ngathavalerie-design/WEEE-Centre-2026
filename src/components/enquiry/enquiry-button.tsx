"use client";

import type { EnquiryKind } from "@/lib/enquiry-types";
import { useEnquiry, type OpenOptions } from "./enquiry-provider";

/**
 * A button that opens the enquiry modal. Usable from server-rendered pages:
 *   <EnquiryButton kind="pickup" className="btn">Schedule a pickup</EnquiryButton>
 */
export default function EnquiryButton({
  kind,
  options,
  className = "btn",
  children,
}: {
  kind: EnquiryKind;
  options?: OpenOptions;
  className?: string;
  children: React.ReactNode;
}) {
  const { open } = useEnquiry();
  return (
    <button type="button" className={className} onClick={() => open(kind, options)}>
      {children}
    </button>
  );
}
