import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { errorMessage } from "../../lib/errorMessage";
import AuthTurnstile from "../../components/auth/AuthTurnstile";
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
    setMessage("If an account exists for that email, a password reset link has been sent.");
  }

  return <main style={pageStyle}>
    <h1>Reset password</h1>
    {error && <p role="alert" style={{ color: "#b91c1c" }}>{error}</p>}
    {message && <p role="status" style={{ color: "#166534" }}>{message}</p>}
    <form onSubmit={send} style={formStyle}>
      <label>Email<input required autoComplete="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
      <AuthTurnstile onToken={setCaptchaToken} resetSignal={captchaReset} />
      <button disabled={busy || (turnstileEnabled && !captchaToken)} type="submit">{busy ? "Sending…" : "Send reset email"}</button>
    </form>
    <p><Link to="/login">Return to login</Link></p>
  </main>;
}

const pageStyle = { width: "min(420px, calc(100% - 32px))", margin: "64px auto" };
const formStyle = { display: "grid", gap: 16 };
