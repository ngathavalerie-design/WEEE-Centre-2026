"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { OPEN_SETTINGS_EVENT, setConsent, useConsent, openCookieSettings } from "@/lib/consent";

/**
 * Cookie banner. Shows on the first visit until the visitor chooses, and again
 * whenever <CookieSettingsButton /> is clicked. "Accept" and "Reject" are equally
 * prominent, and Google Analytics only loads after "Accept" — in line with
 * consent requirements under Kenya's Data Protection Act, 2019.
 */
export default function CookieConsent() {
  const consent = useConsent();
  const [reopened, setReopened] = useState(false);

  useEffect(() => {
    const open = () => setReopened(true);
    window.addEventListener(OPEN_SETTINGS_EVENT, open);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, open);
  }, []);

  const visible = reopened || consent === "unset";
  if (!visible) return null;

  const choose = (choice: "granted" | "denied") => {
    setConsent(choice);
    setReopened(false);
  };

  return (
    <div className="cookie-banner" role="dialog" aria-live="polite" aria-label="Cookie preferences">
      <div className="cookie-banner__text">
        <strong>Cookies on weeecentre.com</strong>
        <p>
          We use essential cookies to keep the site and forms working. With your permission we&apos;d also use
          Google Analytics cookies to understand how the site is used so we can improve it. See our{" "}
          <Link href="/privacy">Privacy Policy</Link>.
          {reopened && consent !== "unset" && consent !== "server" && (
            <> Current choice: <strong>{consent === "granted" ? "analytics allowed" : "essential only"}</strong>.</>
          )}
        </p>
      </div>
      <div className="cookie-banner__actions">
        <button type="button" className="cookie-banner__btn" onClick={() => choose("denied")}>
          Essential only
        </button>
        <button type="button" className="cookie-banner__btn cookie-banner__btn--accept" onClick={() => choose("granted")}>
          Accept analytics
        </button>
      </div>
    </div>
  );
}

/** Put this in every footer, next to the Privacy Policy link. */
export function CookieSettingsButton({ className = "cookie-settings-link" }: { className?: string }) {
  return (
    <button type="button" className={className} onClick={openCookieSettings}>
      Cookie settings
    </button>
  );
}
