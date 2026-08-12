import { useState, type FormEvent } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import AuthShell from "../../components/auth/AuthShell";
import AuthTurnstile from "../../components/auth/AuthTurnstile";
import { useAuth } from "../../hooks/useAuth";
import { errorMessage } from "../../lib/errorMessage";
import { isSupabaseConfigured, supabase, supabaseConfigMessage } from "../../lib/supabase";
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

  if (!loading && session) return <Navigate to="/" replace />;

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    if (!isSupabaseConfigured()) {
      setError(supabaseConfigMessage);
      setBusy(false);
      return;
    }
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password, options: { captchaToken: captchaToken || undefined } });
    setCaptchaToken(""); setCaptchaReset((value) => value + 1);
    setBusy(false);
    if (authError) { setError(errorMessage(authError, "Unable to sign in.")); return; }
    const requested = (location.state as { from?: string } | null)?.from;
    navigate(requested || "/", { replace: true });
  }

  const status = error ? <p role="alert" style={{ color: "#b91c1c" }}>{error}</p> : !isSupabaseConfigured() ? <p role="alert" style={{ color: "#b91c1c" }}>{supabaseConfigMessage}</p> : undefined;
  const footer = <>
    <p><Link to="/forgot-password">Forgot your password?</Link></p>
    <p>New to HLC? <Link to="/register">Create your account</Link>.</p>
    <p><a href="https://homeleadconnect.org">Return to HomeLead Connect</a></p>
  </>;

  return <AuthShell title="Sign in" description="Use your one HomeLead Connect account to reach the workspace or portal assigned to you." status={status} footer={footer}>
    <form className="hlc-auth-form" onSubmit={login}>
      <label>Email<input required autoComplete="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
      <label>Password<input required autoComplete="current-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
      <AuthTurnstile onToken={setCaptchaToken} resetSignal={captchaReset} />
      <button disabled={busy || !isSupabaseConfigured() || (turnstileEnabled && !captchaToken)} type="submit">{busy ? "Signing in…" : "Sign in to HLC"}</button>
    </form>
  </AuthShell>;
}
