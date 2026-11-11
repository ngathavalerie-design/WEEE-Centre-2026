import { redirect } from "next/navigation";
import { isAdmin } from "@/lib/admin-auth";
import { loginAction } from "../actions";

const ERRORS: Record<string, string> = {
  "1": "That password isn't right.",
  locked: "Too many wrong attempts. Please wait 15 minutes and try again.",
  config: "Admin login isn't set up yet. Add ADMIN_PASSWORD and ADMIN_SESSION_SECRET to the environment variables.",
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  if (await isAdmin()) redirect("/admin");
  const params = await searchParams;
  const error = typeof params.error === "string" ? ERRORS[params.error] : undefined;
  const signedOut = params.signedout === "1";

  return (
    <main className="admin-login">
      <form action={loginAction} className="admin-card admin-login__card">
        <h1>WEEE Centre admin</h1>
        <p className="admin-muted">Sign in to manage pickups and enquiries.</p>

        {error && (
          <p className="admin-alert admin-alert--error" role="alert">
            {error}
          </p>
        )}
        {signedOut && !error && <p className="admin-alert">You&apos;ve been signed out.</p>}

        <label className="admin-field">
          Password
          <input type="password" name="password" autoComplete="current-password" required autoFocus />
        </label>
        <button type="submit" className="admin-btn admin-btn--primary">
          Sign in
        </button>
      </form>
    </main>
  );
}
