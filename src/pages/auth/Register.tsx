import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import AuthShell from "../../components/auth/AuthShell";
import AuthTurnstile from "../../components/auth/AuthTurnstile";
import { errorMessage } from "../../lib/errorMessage";
import { isSupabaseConfigured, supabase, supabaseConfigMessage } from "../../lib/supabase";
import { turnstileEnabled } from "../../lib/turnstile";

export default function Register() {
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
    if (!isSupabaseConfigured()) {
      setError(supabaseConfigMessage);
      setBusy(false);
      return;
    }
    const { error: authError } = await supabase.auth.signUp({
      email: email.trim(),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        captchaToken: captchaToken || undefined,
        data: {
          company_name: companyName.trim(),
          full_name: fullName.trim(),
          account_type: "company_owner",
        },
      },
    });
    setCaptchaToken(""); setCaptchaReset((value) => value + 1);
    setBusy(false);
    if (authError) { setError(errorMessage(authError, "Unable to create the company account.")); return; }
    setMessage("Company account created. Check your email for the confirmation link before signing in.");
  }

  const status = <>
    {(error || !isSupabaseConfigured()) && <p role="alert" style={{ color: "#b91c1c" }}>{error || supabaseConfigMessage}</p>}
    {message && <p role="status" style={{ color: "#166534" }}>{message}</p>}
  </>;
  const footer = <>
    <p>Already registered? <Link to="/login">Sign in</Link>.</p>
    <p><a href="https://homeleadconnect.org">Return to HomeLead Connect</a></p>
  </>;

  return <AuthShell title="Create your company workspace" description="Start an isolated HLC workspace for your company. Resident and provider portal access is handled separately through invitations." status={status} footer={footer}>
    <form className="hlc-auth-form" onSubmit={register}>
      <label>Company name<input required maxLength={120} autoComplete="organization" value={companyName} onChange={(event) => setCompanyName(event.target.value)} /></label>
      <label>Your name<input required maxLength={120} autoComplete="name" value={fullName} onChange={(event) => setFullName(event.target.value)} /></label>
      <label>Email<input required autoComplete="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
      <label>Password<input required minLength={8} autoComplete="new-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
      <AuthTurnstile onToken={setCaptchaToken} resetSignal={captchaReset} />
      <button disabled={busy || !isSupabaseConfigured() || !companyName.trim() || !fullName.trim() || (turnstileEnabled && !captchaToken)} type="submit">{busy ? "Creating company workspace…" : "Create company workspace"}</button>
    </form>
  </AuthShell>;
}
