"use client";

import { useEffect, useRef } from "react";

/**
 * Google reCAPTCHA v2 checkbox. Renders only when NEXT_PUBLIC_RECAPTCHA_SITE_KEY is set
 * (and the server checks it only when RECAPTCHA_SECRET_KEY is set).
 */

declare global {
  interface Window {
    grecaptcha?: {
      ready: (cb: () => void) => void;
      render: (el: HTMLElement, opts: Record<string, unknown>) => number;
      reset: (id?: number) => void;
    };
    __weeeRecaptchaLoad?: Promise<void>;
  }
}

export const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY || "";

function loadScript(): Promise<void> {
  if (window.__weeeRecaptchaLoad) return window.__weeeRecaptchaLoad;
  window.__weeeRecaptchaLoad = new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://www.google.com/recaptcha/api.js?render=explicit";
    s.async = true;
    s.defer = true;
    s.onload = () => window.grecaptcha?.ready(() => resolve());
    s.onerror = () => reject(new Error("reCAPTCHA failed to load"));
    document.head.appendChild(s);
  });
  return window.__weeeRecaptchaLoad;
}

export default function Recaptcha({ onToken, resetKey }: { onToken: (token: string) => void; resetKey?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const widgetId = useRef<number | null>(null);
  const onTokenRef = useRef(onToken);

  useEffect(() => {
    onTokenRef.current = onToken;
  }, [onToken]);

  useEffect(() => {
    if (!RECAPTCHA_SITE_KEY || !ref.current) return;
    let cancelled = false;
    loadScript()
      .then(() => {
        if (cancelled || !ref.current || !window.grecaptcha || widgetId.current !== null) return;
        widgetId.current = window.grecaptcha.render(ref.current, {
          sitekey: RECAPTCHA_SITE_KEY,
          callback: (t: string) => onTokenRef.current(t),
          "expired-callback": () => onTokenRef.current(""),
        });
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (resetKey && widgetId.current !== null) window.grecaptcha?.reset(widgetId.current);
  }, [resetKey]);

  if (!RECAPTCHA_SITE_KEY) return null;
  return <div ref={ref} />;
}
