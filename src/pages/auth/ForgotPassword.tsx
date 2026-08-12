import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import AuthShell from "../../components/auth/AuthShell";
import AuthTurnstile from "../../components/auth/AuthTurnstile";
import { errorMessage } from "../../lib/errorMessage";
import { supabase } from "../../lib/supabase";
import { turnstileEnabled } from "../../lib/turnstile";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaReset, setCaptchaReset] = useState(0);

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    const { error: authError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
      captchaToken: captchaToken || undefined,
    });
    setCaptchaToken(""); setCaptchaReset((value) => value + 1);
    setBusy(false);
    if (authError) { setError(errorMessage(authError, "Unable to request a reset email.")); return; }
    setMessage("If an HLC account exists for that email, a password reset link has been sent.");
  }

  const status = <>
    {error && <p role="alert" style={{ color: "#b91c1c" }}>{error}</p>}
    {message && <p role="status" style={{ color: "#166534" }}>{message}</p>}
  </>;
  const footer = <>
    <p><Link to="/login">Return to sign in</Link></p>
    <p><Link to="/">Return to HomeLead Connect</Link></p>
  </>;

  return <AuthShell title="Recover your account" description="Enter the email for your HLC account. We will send one secure recovery link when that account exists." status={status} footer={footer}>
    <form className="hlc-auth-form" onSubmit={send}>
      <label>Email<input required autoComplete="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
      <AuthTurnstile onToken={setCaptchaToken} resetSignal={captchaReset} />
      <button disabled={busy || (turnstileEnabled && !captchaToken)} type="submit">{busy ? "Sending…" : "Send secure reset link"}</button>
    </form>
  </AuthShell>;
}
