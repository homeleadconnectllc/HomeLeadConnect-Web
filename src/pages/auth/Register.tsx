import { useState, type FormEvent } from "react";
import { Link, useLocation } from "react-router-dom";
import AuthShell from "../../components/auth/AuthShell";
import AuthTurnstile from "../../components/auth/AuthTurnstile";
import { errorMessage } from "../../lib/errorMessage";
import { isSupabaseConfigured, supabase, supabaseConfigMessage } from "../../lib/supabase";
import { turnstileEnabled } from "../../lib/turnstile";

function safeNext(search: string) {
  const raw = new URLSearchParams(search).get("next")?.trim() || "";
  return raw.startsWith("/") && !raw.startsWith("//") ? raw : null;
}

export default function Register() {
  const location = useLocation();
  const next = safeNext(location.search);
  const invitedIdentity = Boolean(
    next?.startsWith("/team/accept?") || next?.startsWith("/portal/accept?"),
  );
  const [companyName, setCompanyName] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaReset, setCaptchaReset] = useState(0);

  async function register(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    if (!isSupabaseConfigured()) { setError(supabaseConfigMessage); setBusy(false); return; }
    const loginDestination = next ? `/login?next=${encodeURIComponent(next)}` : "/login";
    const { error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}${loginDestination}`,
        captchaToken: captchaToken || undefined,
        data: {
          company_name: invitedIdentity ? undefined : companyName.trim(),
          full_name: fullName.trim(),
          account_type: invitedIdentity ? "workspace_invitee" : "company_owner",
        },
      },
    });
    setCaptchaToken(""); setCaptchaReset((value) => value + 1); setBusy(false);
    if (authError) { setError(errorMessage(authError, invitedIdentity ? "Unable to create your HomeLead Connect identity." : "Unable to create the company account.")); return; }
    setMessage(invitedIdentity
      ? "HLC identity created. Check your email for the confirmation link, then return to accept the company invitation."
      : "Company account created. Check your email for the confirmation link before signing in.");
  }

  const loginHref = next ? `/login?next=${encodeURIComponent(next)}` : "/login";

  if (message) {
    return <AuthShell
      title={invitedIdentity ? "Your HomeLead Connect identity is created" : "Your company workspace is created"}
      description={invitedIdentity ? "One more step: confirm your email, then return to the invitation." : "You’re done here for now. HomeLead Connect created your company account and workspace."}
      status={null}
      footer={<p><a href="https://homeleadconnect.org">Return to HomeLead Connect</a></p>}
    >
      <section aria-live="polite" style={{ display: "grid", gap: 16 }}>
        <div style={{ padding: 18, borderRadius: 8, background: "#ecfdf5", border: "1px solid #86efac", color: "#14532d" }}>
          <strong style={{ display: "block", marginBottom: 6, fontSize: 18 }}>Account created successfully.</strong>
          <span>{message}</span>
        </div>
        <div style={{ padding: 16, borderRadius: 8, background: "#eff6ff", border: "1px solid #93c5fd", color: "#1e3a8a" }}>
          <strong style={{ display: "block", marginBottom: 6 }}>What to do next</strong>
          <span>Open the confirmation email sent to <strong>{email.trim()}</strong> and confirm your address. After that, use Sign in to continue. You do not need to create the workspace again.</span>
        </div>
        <Link to={loginHref} style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", minHeight: 48, padding: "12px 18px", borderRadius: 8, background: "#2563eb", color: "#fff", fontWeight: 800, textDecoration: "none" }}>Sign in after confirming email</Link>
      </section>
    </AuthShell>;
  }

  const status = <>
    {(error || !isSupabaseConfigured()) && <p role="alert" style={{ color: "#b91c1c" }}>{error || supabaseConfigMessage}</p>}
  </>;
  const footer = <>
    <p>Already registered? <Link to={loginHref}>Sign in</Link>.</p>
    <p><a href="https://homeleadconnect.org">Return to HomeLead Connect</a></p>
  </>;

  return <AuthShell
    title={invitedIdentity ? "Create your HomeLead Connect identity" : "Create your company workspace"}
    description={invitedIdentity ? "Create your identity for this invitation. HomeLead Connect will not create a separate company workspace for you." : "Start an isolated HLC workspace for your company. Resident and provider portal access is handled separately through invitations."}
    status={status}
    footer={footer}
  >
    <form className="hlc-auth-form" onSubmit={register}>
      {!invitedIdentity && <label>Company name<input required maxLength={120} autoComplete="organization" value={companyName} onChange={(event) => setCompanyName(event.target.value)} /></label>}
      <label>Your name<input required maxLength={120} autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} /></label>
      <label>Email<input required autoComplete="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
      <label>Password<input required minLength={8} autoComplete="new-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
      <AuthTurnstile onToken={setCaptchaToken} resetSignal={captchaReset} />
      <button disabled={busy || !isSupabaseConfigured() || (!invitedIdentity && !companyName.trim()) || !fullName.trim() || (turnstileEnabled && !captchaToken)} type="submit">
        {busy ? "Creating account…" : invitedIdentity ? "Create HomeLead Connect identity" : "Create company workspace"}
      </button>
    </form>
  </AuthShell>;
}
