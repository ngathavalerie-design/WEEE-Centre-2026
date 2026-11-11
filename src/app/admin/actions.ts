"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  clearFailedLogins,
  endAdminSession,
  isAdminConfigured,
  loginAllowed,
  passwordMatches,
  recordFailedLogin,
  requireAdmin,
  startAdminSession,
} from "@/lib/admin-auth";
import { updatePickup } from "@/lib/admin-data";
import { sendPickupStatusEmail } from "@/lib/notify";
import { isPickupStatus } from "@/lib/pickup-status";

export async function loginAction(formData: FormData): Promise<void> {
  if (!isAdminConfigured()) redirect("/admin/login?error=config");
  if (!(await loginAllowed())) redirect("/admin/login?error=locked");

  const password = String(formData.get("password") ?? "");
  if (!passwordMatches(password)) {
    await recordFailedLogin();
    redirect("/admin/login?error=1");
  }

  await clearFailedLogins();
  await startAdminSession();
  redirect("/admin");
}

export async function logoutAction(): Promise<void> {
  await endAdminSession();
  redirect("/admin/login?signedout=1");
}

/** Only allow redirects back into the admin area. */
function safeReturnTo(v: FormDataEntryValue | null): string {
  const s = typeof v === "string" ? v : "";
  return s.startsWith("/admin") && !s.startsWith("//") ? s : "/admin";
}

function withParam(path: string, key: string, value: string): string {
  const url = new URL(path, "http://x");
  url.searchParams.set(key, value);
  return `${url.pathname}${url.search}`;
}

/** `datetime-local` value ("2026-11-14T10:30") interpreted as Nairobi time (UTC+3, no DST). */
function nairobiLocalToIso(v: string): string | null {
  return /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/.test(v) ? `${v}:00+03:00` : null;
}

const text = (v: FormDataEntryValue | null, max: number) =>
  typeof v === "string" ? v.replace(/[<>]/g, "").trim().slice(0, max) || null : null;

export async function updatePickupAction(formData: FormData): Promise<void> {
  await requireAdmin();

  const returnTo = safeReturnTo(formData.get("returnTo"));
  const id = String(formData.get("id") ?? "");
  const status = formData.get("status");
  if (!/^[0-9a-f-]{36}$/i.test(id) || !isPickupStatus(status)) {
    redirect(withParam(returnTo, "error", "Invalid update"));
  }

  const result = await updatePickup({
    id,
    status,
    scheduledFor: nairobiLocalToIso(String(formData.get("scheduledFor") ?? "")),
    customerMessage: text(formData.get("customerMessage"), 500),
    staffNotes: text(formData.get("staffNotes"), 2000),
  });
  if (!result) redirect(withParam(returnTo, "error", "Pickup not found"));

  let note = `${result.reference} saved`;
  if (result.statusChanged && formData.get("notify") === "on") {
    const sent = await sendPickupStatusEmail({
      to: result.email,
      name: result.name,
      reference: result.reference,
      status: result.status,
      scheduledFor: result.scheduledFor,
      customerMessage: result.customerMessage,
    });
    note += sent ? " — customer emailed" : " — email could not be sent";
  }

  revalidatePath("/admin");
  redirect(withParam(returnTo, "saved", note));
}
