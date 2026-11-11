"use client";

import { useSyncExternalStore } from "react";

/**
 * Cookie-consent state, stored in localStorage (plus a first-party cookie so the
 * server could read it later if needed). Shared by the banner and Google Analytics.
 */

export type ConsentChoice = "granted" | "denied";
export type ConsentState = ConsentChoice | "unset" | "server";

const KEY = "weee_consent";
const CHANGE_EVENT = "weee:consent-change";
export const OPEN_SETTINGS_EVENT = "weee:open-cookie-settings";

function read(): ConsentState {
  try {
    const v = window.localStorage.getItem(KEY);
    return v === "granted" || v === "denied" ? v : "unset";
  } catch {
    return "unset";
  }
}

function subscribe(onChange: () => void): () => void {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/** "server" during server rendering / first hydration pass, then the real value. */
export function useConsent(): ConsentState {
  return useSyncExternalStore(subscribe, read, () => "server");
}

export function setConsent(choice: ConsentChoice): void {
  try {
    window.localStorage.setItem(KEY, choice);
  } catch {
    // private mode — the cookie below still records it for this session
  }
  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${KEY}=${choice}; Max-Age=${60 * 60 * 24 * 180}; Path=/; SameSite=Lax${secure}`;

  // If GA is already loaded (e.g. the visitor is withdrawing consent), tell it immediately.
  window.gtag?.("consent", "update", { analytics_storage: choice });
  if (choice === "denied") clearGoogleAnalyticsCookies();

  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function openCookieSettings(): void {
  window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT));
}

function clearGoogleAnalyticsCookies(): void {
  const host = window.location.hostname;
  const domains = ["", host, `.${host}`, `.${host.replace(/^www\./, "")}`];
  for (const c of document.cookie.split(";")) {
    const name = c.split("=")[0].trim();
    if (name === "_ga" || name.startsWith("_ga_") || name === "_gid") {
      for (const d of domains) {
        document.cookie = `${name}=; Max-Age=0; Path=/${d ? `; Domain=${d}` : ""}`;
      }
    }
  }
}
