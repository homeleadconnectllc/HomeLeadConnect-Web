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
  const invitedStaff = Boolean(next?.startsWith("/team/accept?"));
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
          company_name: invitedStaff ? undefined : companyName.trim(),
          full_name: fullName.trim(),
          account_type: invitedStaff ? "workspace_invitee" : "company_owner",
        },
      },
    });
    setCaptchaToken(""); setCaptchaReset((value) => value + 1); setBusy(false);
    if (authError) { setError(errorMessage(authError, invitedStaff ? "Unable to create your HLC identity." : "Unable to create the company account.")); return; }
    setMessage(invitedStaff
      ? "HLC identity created. Check your email for the confirmation link, then return to accept the company invitation."
      : "Company account created. Check your email for the confirmation link before signing in.");
  }

  const status = <>
    {(error || !isSupabaseConfigured()) && <p role="alert" style={{ color: "#b91c1c" }}>{error || supabaseConfigMessage}</p>}
    {message && <p role="status" style={{ color: "#166534" }}>{message}</p>}
  </>;
  const loginHref = next ? `/login?next=${encodeURIComponent(next)}` : "/login";
  const footer = <>
    <p>Already registered? <Link to={loginHref}>Sign in</Link>.</p>
    <p><a href="https://homeleadconnect.org">Return to HomeLead Connect</a></p>
  </>;

  return <AuthShell
    title={invitedStaff ? "Create your HLC identity" : "Create your company workspace"}
    description={invitedStaff ? "Create your identity for the company invitation. HLC will not create a separate workspace for you." : "Start an isolated HLC workspace for your company. Resident and provider portal access is handled separately through invitations."}
    status={status}
    footer={footer}
  >
    <form className="hlc-auth-form" onSubmit={register}>
      {!invitedStaff && <label>Company name<input required maxLength={120} autoComplete="organization" value={companyName} onChange={(event) => setCompanyName(event.target.value)} /></label>}
      <label>Your name<input required maxLength={120} autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} /></label>
      <label>Email<input required autoComplete="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
      <label>Password<input required minLength={8} autoComplete="new-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
      <AuthTurnstile onToken={setCaptchaToken} resetSignal={captchaReset} />
      <button disabled={busy || !isSupabaseConfigured() || (!invitedStaff && !companyName.trim()) || !fullName.trim() || (turnstileEnabled && !captchaToken)} type="submit">
        {busy ? "Creating account…" : invitedStaff ? "Create HLC identity" : "Create company workspace"}
      </button>
    </form>
  </AuthShell>;
}
