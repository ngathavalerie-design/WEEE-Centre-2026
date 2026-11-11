"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import Link from "next/link";
import PickupFields, { validatePickupClient } from "@/components/pickup-fields";
import Recaptcha, { RECAPTCHA_SITE_KEY } from "@/components/recaptcha";
import { CheckIcon, CloseIcon } from "@/components/icons";
import { EMPTY_PICKUP, type PickupDetails } from "@/lib/pickup";
import { ENQUIRY_COPY, type EnquiryKind } from "@/lib/enquiry-types";
import { SERVICES, EVENT_TYPES } from "@/content/site";
import { postWithCsrf } from "@/lib/csrf-client";
import { trackFormOpen, trackLead, trackPickupScheduled } from "@/lib/analytics";
import type { OpenOptions } from "./enquiry-provider";

type Status = { kind: "idle" } | { kind: "sending" } | { kind: "error"; message: string } | { kind: "done"; message: string; reference?: string };

export default function EnquiryModal({
  kind,
  options,
  onClose,
}: {
  kind: EnquiryKind;
  options: OpenOptions;
  onClose: () => void;
}) {
  const copy = ENQUIRY_COPY[kind];
  const dialogRef = useRef<HTMLDivElement>(null);
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [organization, setOrganization] = useState("");
  const [message, setMessage] = useState("");
  const [service, setService] = useState(options.service ?? "");
  const [eventInterest, setEventInterest] = useState(options.eventInterest ?? "");
  const [pickup, setPickup] = useState<PickupDetails>(EMPTY_PICKUP);
  const [website, setWebsite] = useState(""); // honeypot
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const [recaptchaReset, setRecaptchaReset] = useState(0);
  const [status, setStatus] = useState<Status>({ kind: "idle" });

  const isSubscribe = kind === "subscribe";
  const isPickup = kind === "pickup";
  const showService = kind === "quote" || kind === "service";
  const showEvent = kind === "event" || kind === "conference";

  // Open: analytics, focus, scroll lock, Escape to close.
  useEffect(() => {
    trackFormOpen(kind);
    firstFieldRef.current?.focus();
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCloseRef.current();
      if (e.key === "Tab" && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input:not([disabled]):not([tabindex="-1"]), select, textarea, iframe',
        );
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      document.removeEventListener("keydown", onKey);
    };
  }, [kind]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (isPickup) {
      const err = validatePickupClient(pickup);
      if (err) return setStatus({ kind: "error", message: err });
      if (phone.trim().length < 9) return setStatus({ kind: "error", message: "Please add a phone number so our driver can reach you." });
    }
    if (RECAPTCHA_SITE_KEY && !recaptchaToken) {
      return setStatus({ kind: "error", message: "Please tick the “I'm not a robot” box." });
    }

    const subject = isPickup
      ? `Pickup request — ${pickup.preferredDate}`
      : showService && service
        ? `${copy.emailSubject}: ${service}`
        : showEvent && eventInterest
          ? `${copy.emailSubject}: ${eventInterest}`
          : copy.emailSubject;

    setStatus({ kind: "sending" });
    try {
      const res = await postWithCsrf("/api/enquiry", {
        type: kind,
        name,
        email,
        phone,
        organization,
        subject,
        message,
        website,
        recaptchaToken,
        additionalData: {
          ...(showService && service ? { service } : {}),
          ...(showEvent && eventInterest ? { eventInterest } : {}),
          ...(isPickup ? { pickup } : {}),
        },
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; message?: string; reference?: string };
      if (!res.ok) {
        setRecaptchaReset((n) => n + 1);
        setRecaptchaToken("");
        return setStatus({ kind: "error", message: data.error ?? "Something went wrong. Please try again." });
      }
      trackLead(kind);
      if (isPickup) {
        trackPickupScheduled({
          timeWindow: pickup.timeWindow,
          itemCount: pickup.itemCategories.length,
          dataDestruction: pickup.needsDataDestruction,
          usedMyLocation: pickup.latitude != null,
        });
      }
      setStatus({ kind: "done", message: data.message ?? copy.success, reference: data.reference });
    } catch {
      setStatus({ kind: "error", message: "We couldn't reach the server. Check your connection and try again." });
    }
  }

  return (
    <div
      className="modal-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby="enquiry-title" ref={dialogRef}>
        <div className="modal__head">
          <div>
            <h2 id="enquiry-title">{copy.title}</h2>
            {status.kind !== "done" && <p>{copy.intro}</p>}
          </div>
          <button type="button" className="modal__close" onClick={onClose} aria-label="Close">
            <CloseIcon size={20} />
          </button>
        </div>

        <div className="modal__body">
          {status.kind === "done" ? (
            <div className="modal__success" role="status">
              <div className="card__icon">
                <CheckIcon />
              </div>
              <p>{status.message}</p>
              {status.reference && (
                <>
                  <p style={{ margin: 0 }}>Your pickup reference:</p>
                  <div className="modal__ref">{status.reference}</div>
                  <p>
                    We&apos;ve emailed it to you too.{" "}
                    <Link href={`/track?ref=${status.reference}`} onClick={onClose}>
                      Track your pickup →
                    </Link>
                  </p>
                </>
              )}
              <button type="button" className="btn" onClick={onClose}>
                Done
              </button>
            </div>
          ) : (
            <form className="form" onSubmit={onSubmit} noValidate={false}>
              {isPickup && <PickupFields value={pickup} onChange={setPickup} />}

              <div className="form__row">
                <label className="field">
                  Full name *
                  <input ref={firstFieldRef} required maxLength={120} autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} />
                </label>
                <label className="field">
                  Email *
                  <input type="email" required maxLength={200} autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} />
                </label>
              </div>

              {!isSubscribe && (
                <div className="form__row">
                  <label className="field">
                    Phone {isPickup ? "*" : ""}
                    <input
                      type="tel"
                      required={isPickup}
                      maxLength={30}
                      autoComplete="tel"
                      placeholder="0712 345 678"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </label>
                  <label className="field">
                    Organisation
                    <input maxLength={150} autoComplete="organization" value={organization} onChange={(e) => setOrganization(e.target.value)} />
                  </label>
                </div>
              )}

              {showService && (
                <label className="field">
                  Service
                  <select value={service} onChange={(e) => setService(e.target.value)}>
                    <option value="">Not sure / general</option>
                    {SERVICES.map((s) => (
                      <option key={s.slug} value={s.title}>
                        {s.title}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              {showEvent && (
                <label className="field">
                  {kind === "conference" ? "Conference / engagement" : "Event interest"}
                  <select value={eventInterest} onChange={(e) => setEventInterest(e.target.value)}>
                    <option value="">Choose one</option>
                    {options.eventInterest && !EVENT_TYPES.includes(options.eventInterest) && (
                      <option value={options.eventInterest}>{options.eventInterest}</option>
                    )}
                    {EVENT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </label>
              )}

              {!isSubscribe && (
                <label className="field">
                  {copy.messageLabel} {copy.messageRequired ? "*" : ""}
                  <textarea
                    required={copy.messageRequired}
                    maxLength={1000}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </label>
              )}

              {/* Honeypot: hidden from people, bots fill it in. */}
              <label className="hp-field" aria-hidden="true">
                Website
                <input tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
              </label>

              <Recaptcha onToken={setRecaptchaToken} resetKey={recaptchaReset} />

              {status.kind === "error" && (
                <p className="alert alert--error" role="alert">
                  {status.message}
                </p>
              )}

              <button type="submit" className="btn btn--block" disabled={status.kind === "sending"}>
                {status.kind === "sending" ? "Sending…" : copy.submit}
              </button>
              <p className="form__note">
                We use your details only to respond to this request. See our <Link href="/privacy">Privacy Policy</Link>.
              </p>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
