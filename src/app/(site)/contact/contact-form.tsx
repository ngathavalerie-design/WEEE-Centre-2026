"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import Recaptcha, { RECAPTCHA_SITE_KEY } from "@/components/recaptcha";
import { postWithCsrf } from "@/lib/csrf-client";
import { trackLead } from "@/lib/analytics";

const EMPTY = { name: "", email: "", phone: "", organization: "", subject: "", message: "", website: "" };

export default function ContactForm() {
  const [form, setForm] = useState(EMPTY);
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const [recaptchaReset, setRecaptchaReset] = useState(0);
  const [status, setStatus] = useState<{ kind: "idle" | "sending" | "error" | "done"; message?: string }>({ kind: "idle" });

  const set = (key: keyof typeof EMPTY) => (e: { target: { value: string } }) => setForm({ ...form, [key]: e.target.value });

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (RECAPTCHA_SITE_KEY && !recaptchaToken) {
      return setStatus({ kind: "error", message: "Please tick the “I'm not a robot” box." });
    }
    setStatus({ kind: "sending" });
    try {
      const res = await postWithCsrf("/api/contact", { ...form, recaptchaToken });
      const data = (await res.json().catch(() => ({}))) as { error?: string; message?: string };
      if (!res.ok) {
        setRecaptchaReset((n) => n + 1);
        setRecaptchaToken("");
        return setStatus({ kind: "error", message: data.error ?? "Something went wrong. Please try again." });
      }
      trackLead("contact");
      setForm(EMPTY);
      setStatus({ kind: "done", message: data.message });
    } catch {
      setStatus({ kind: "error", message: "We couldn't reach the server. Check your connection and try again." });
    }
  }

  if (status.kind === "done") {
    return (
      <div className="card">
        <p className="alert alert--success" role="status">
          {status.message}
        </p>
        <button type="button" className="btn btn--outline" onClick={() => setStatus({ kind: "idle" })}>
          Send another message
        </button>
      </div>
    );
  }

  return (
    <form className="form card" onSubmit={onSubmit}>
      <h2 style={{ fontSize: "1.4rem" }}>Send us a message</h2>
      <div className="form__row">
        <label className="field">
          Full name *
          <input required maxLength={120} autoComplete="name" value={form.name} onChange={set("name")} />
        </label>
        <label className="field">
          Email *
          <input type="email" required maxLength={200} autoComplete="email" value={form.email} onChange={set("email")} />
        </label>
      </div>
      <div className="form__row">
        <label className="field">
          Phone
          <input type="tel" maxLength={30} autoComplete="tel" value={form.phone} onChange={set("phone")} />
        </label>
        <label className="field">
          Organisation
          <input maxLength={150} autoComplete="organization" value={form.organization} onChange={set("organization")} />
        </label>
      </div>
      <label className="field">
        Subject *
        <input required maxLength={200} value={form.subject} onChange={set("subject")} />
      </label>
      <label className="field">
        Message *
        <textarea required maxLength={1000} value={form.message} onChange={set("message")} />
      </label>

      <label className="hp-field" aria-hidden="true">
        Website
        <input tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} />
      </label>

      <Recaptcha onToken={setRecaptchaToken} resetKey={recaptchaReset} />

      {status.kind === "error" && (
        <p className="alert alert--error" role="alert">
          {status.message}
        </p>
      )}
      <button type="submit" className="btn" disabled={status.kind === "sending"}>
        {status.kind === "sending" ? "Sending…" : "Send message"}
      </button>
      <p className="form__note">
        We use your details only to reply to you. See our <Link href="/privacy">Privacy Policy</Link>.
      </p>
    </form>
  );
}
