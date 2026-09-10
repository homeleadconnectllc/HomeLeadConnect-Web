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
    if (authError) { setError(errorMessage(authError, invitedIdentity ? "Unable to create your identity." : "Unable to create the company account.")); return; }
    setMessage(invitedIdentity
      ? "Identity created. Check your email for the confirmation link, then return to accept the invitation."
      : "Company account created. Check your email for the confirmation link before signing in.");
  }

  const loginHref = next ? `/login?next=${encodeURIComponent(next)}` : "/login";

  if (message) {
    return <AuthShell
      title={invitedIdentity ? "Your identity is created" : "Your company workspace is created"}
      description={invitedIdentity ? "Confirm your email, then return to the invitation." : "You’re done here for now. Your account and workspace are ready for confirmation."}
      status={null}
      footer={<p><a href="https://homeleadconnect.org">Public site</a></p>}
    >
      <section className="hlc-auth-success" aria-live="polite">
        <div className="hlc-auth-success-primary">
          <strong>Account created.</strong>
          <span>{message}</span>
        </div>
        <div className="hlc-auth-success-next">
          <strong>Next step</strong>
          <span>Open the confirmation email sent to <strong>{email.trim()}</strong>. After confirming, sign in to continue. You do not need to create the workspace again.</span>
        </div>
        <Link className="hlc-auth-success-action" to={loginHref}>Sign in after confirming email</Link>
      </section>
    </AuthShell>;
  }

  const status = <>
    {(error || !isSupabaseConfigured()) && <p role="alert" style={{ color: "#b91c1c" }}>{error || supabaseConfigMessage}</p>}
  </>;
  const footer = <>
    <p>Already registered? <Link to={loginHref}>Sign in</Link>.</p>
    <p><a href="https://homeleadconnect.org">Public site</a></p>
  </>;

  return <AuthShell
    title={invitedIdentity ? "Create your identity" : "Create your company workspace"}
    description={invitedIdentity ? "Create the account used for this invitation. No separate company workspace will be created." : "Create the workspace your company will use for day-to-day operations."}
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
        {busy ? "Creating account…" : invitedIdentity ? "Create identity" : "Create workspace"}
      </button>
    </form>
  </AuthShell>;
}
