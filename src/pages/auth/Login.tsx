import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { useAuth } from "../../hooks/useAuth";
import { errorMessage } from "../../lib/errorMessage";
import AuthTurnstile from "../../components/auth/AuthTurnstile";
import { turnstileEnabled } from "../../lib/turnstile";

export default function Login() {
  const { session, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaReset, setCaptchaReset] = useState(0);

  if (!loading && session) return <Navigate to="/dashboard" replace />;

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password, options: { captchaToken: captchaToken || undefined } });
    setCaptchaToken(""); setCaptchaReset((value) => value + 1);
    setBusy(false);
    if (authError) { setError(errorMessage(authError, "Unable to sign in.")); return; }
    const requested = (location.state as { from?: string } | null)?.from;
    navigate(requested || "/dashboard", { replace: true });
  }

  return <main style={pageStyle}>
    <h1>CRM login</h1>
    {error && <p role="alert" style={{ color: "#b91c1c" }}>{error}</p>}
    <form onSubmit={login} style={formStyle}>
      <label>Email<input required autoComplete="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
      <label>Password<input required autoComplete="current-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
      <AuthTurnstile onToken={setCaptchaToken} resetSignal={captchaReset} />
      <button disabled={busy || (turnstileEnabled && !captchaToken)} type="submit">{busy ? "Signing in…" : "Sign in"}</button>
    </form>
    <p><Link to="/forgot-password">Forgot password?</Link></p>
    <p>Need an account? <Link to="/register">Create one</Link>.</p>
  </main>;
}

const pageStyle = { width: "min(420px, calc(100% - 32px))", margin: "64px auto" };
const formStyle = { display: "grid", gap: 16 };
