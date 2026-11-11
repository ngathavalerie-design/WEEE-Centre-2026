"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import type { EnquiryKind } from "@/lib/enquiry-types";
import EnquiryModal from "./enquiry-modal";

export interface OpenOptions {
  /** Pre-selects a service (quote / service enquiries). */
  service?: string;
  /** Pre-selects an event or conference name. */
  eventInterest?: string;
}

interface EnquiryContextValue {
  open: (kind: EnquiryKind, options?: OpenOptions) => void;
}

const EnquiryContext = createContext<EnquiryContextValue | null>(null);

/** Wrap the public site once; any <EnquiryButton> inside can open the modal. */
export default function EnquiryProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<{ kind: EnquiryKind; options: OpenOptions; key: number } | null>(null);

  const open = useCallback((kind: EnquiryKind, options: OpenOptions = {}) => {
    setState({ kind, options, key: Date.now() });
  }, []);

  const value = useMemo(() => ({ open }), [open]);

  return (
    <EnquiryContext.Provider value={value}>
      {children}
      {state && (
        <EnquiryModal
          key={state.key}
          kind={state.kind}
          options={state.options}
          onClose={() => setState(null)}
        />
      )}
    </EnquiryContext.Provider>
  );
}

export function useEnquiry(): EnquiryContextValue {
  const ctx = useContext(EnquiryContext);
  if (!ctx) throw new Error("useEnquiry must be used inside <EnquiryProvider>");
  return ctx;
}
