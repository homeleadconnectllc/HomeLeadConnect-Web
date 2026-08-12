import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import AuthShell from "../../components/auth/AuthShell";
import AuthTurnstile from "../../components/auth/AuthTurnstile";
import { errorMessage } from "../../lib/errorMessage";
import { supabase } from "../../lib/supabase";
import { turnstileEnabled } from "../../lib/turnstile";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaReset, setCaptchaReset] = useState(0);

  async function register(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/login`, captchaToken: captchaToken || undefined },
    });
    setCaptchaToken(""); setCaptchaReset((value) => value + 1);
    setBusy(false);
    if (authError) { setError(errorMessage(authError, "Unable to create the account.")); return; }
    setMessage("Account created. Check your email for the confirmation link before signing in.");
  }

  const status = <>
    {error && <p role="alert" style={{ color: "#b91c1c" }}>{error}</p>}
    {message && <p role="status" style={{ color: "#166534" }}>{message}</p>}
  </>;
  const footer = <>
    <p>Already registered? <Link to="/login">Sign in</Link>.</p>
    <p><Link to="/">Return to HomeLead Connect</Link></p>
  </>;

  return <AuthShell title="Create your account" description="Create one HLC identity. Workspace and portal access are assigned separately after your email is verified." status={status} footer={footer}>
    <form className="hlc-auth-form" onSubmit={register}>
      <label>Email<input required autoComplete="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
      <label>Password<input required minLength={8} autoComplete="new-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
      <AuthTurnstile onToken={setCaptchaToken} resetSignal={captchaReset} />
      <button disabled={busy || (turnstileEnabled && !captchaToken)} type="submit">{busy ? "Creating account…" : "Create HLC account"}</button>
    </form>
  </AuthShell>;
}
