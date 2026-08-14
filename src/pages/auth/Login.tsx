import { useState, type FormEvent } from "react";
import type { Provider } from "@supabase/supabase-js";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { trackAnalyticsEvent } from "../../api/analytics";
import AuthShell from "../../components/auth/AuthShell";
import AuthTurnstile from "../../components/auth/AuthTurnstile";
import { useAuth } from "../../hooks/useAuth";
import { errorMessage } from "../../lib/errorMessage";
import { isSupabaseConfigured, supabase, supabaseConfigMessage } from "../../lib/supabase";
import { turnstileEnabled } from "../../lib/turnstile";

type AuthMode = "password" | "magic" | "phone";

const oauthProviders: Array<{ provider: Provider; label: string }> = [
  { provider: "google", label: "Continue with Google" },
  { provider: "apple", label: "Continue with Apple" },
  { provider: "facebook", label: "Continue with Facebook" },
];

export default function Login() {
  const { session, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mode, setMode] = useState<AuthMode>("password");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [captchaToken, setCaptchaToken] = useState("");
  const [captchaReset, setCaptchaReset] = useState(0);

  if (!loading && session) return <Navigate to="/app" replace />;

  function resetStatus() {
    setError("");
    setMessage("");
  }

  function resetCaptcha() {
    setCaptchaToken("");
    setCaptchaReset((value) => value + 1);
  }

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    trackAnalyticsEvent("sign_in_started", { method: "password" });
    setBusy(true);
    resetStatus();
    if (!isSupabaseConfigured()) {
      setError(supabaseConfigMessage);
      setBusy(false);
      return;
    }

    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
      options: { captchaToken: captchaToken || undefined },
    });
    resetCaptcha();
    setBusy(false);
    if (authError) {
      setError(errorMessage(authError, "Unable to sign in."));
      return;
    }
    trackAnalyticsEvent("sign_in_completed", { method: "password" });
    const requested = (location.state as { from?: string } | null)?.from;
    navigate(requested || "/app", { replace: true });
  }

  async function sendMagicLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    trackAnalyticsEvent("sign_in_started", { method: "email_link" });
    setBusy(true);
    resetStatus();
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}/app`,
        captchaToken: captchaToken || undefined,
      },
    });
    resetCaptcha();
    setBusy(false);
    if (authError) {
      setError(errorMessage(authError, "Unable to send the sign-in link."));
      return;
    }
    setMessage("Check your email for your HomeLead Connect sign-in link.");
  }

  async function sendPhoneOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    trackAnalyticsEvent("sign_in_started", { method: "phone_otp" });
    setBusy(true);
    resetStatus();
    const normalized = phone.trim();
    if (!normalized.startsWith("+")) {
      setError("Enter the phone number in international format, for example +17175550123.");
      setBusy(false);
      return;
    }
    const { error: authError } = await supabase.auth.signInWithOtp({
      phone: normalized,
      options: { shouldCreateUser: true, captchaToken: captchaToken || undefined },
    });
    resetCaptcha();
    setBusy(false);
    if (authError) {
      setError(errorMessage(authError, "Phone sign-in is not available yet or the code could not be sent."));
      return;
    }
    setOtpSent(true);
    setMessage("Enter the verification code sent to your phone.");
  }

  async function verifyPhoneOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    resetStatus();
    const { error: authError } = await supabase.auth.verifyOtp({ phone: phone.trim(), token: otp.trim(), type: "sms" });
    setBusy(false);
    if (authError) {
      setError(errorMessage(authError, "Unable to verify that code."));
      return;
    }
    trackAnalyticsEvent("sign_in_completed", { method: "phone_otp" });
    navigate("/app", { replace: true });
  }

  async function oauth(provider: Provider) {
    trackAnalyticsEvent("sign_in_started", { method: provider });
    setBusy(true);
    resetStatus();
    const { error: authError } = await supabase.auth.signInWithOAuth({
      provider,
      options: { redirectTo: `${window.location.origin}/app` },
    });
    if (authError) {
      setError(errorMessage(authError, `${provider} sign-in is not configured for HLC yet.`));
      setBusy(false);
    }
  }

  const status = <>
    {(error || !isSupabaseConfigured()) && <p role="alert" style={{ color: "#b91c1c" }}>{error || supabaseConfigMessage}</p>}
    {message && <p role="status" style={{ color: "#166534" }}>{message}</p>}
  </>;
  const footer = <>
    <p><Link to="/forgot-password">Forgot your password?</Link></p>
    <p>New to HLC? <Link to="/register">Create your account</Link>.</p>
    <p><a href="https://homeleadconnect.org">Return to HomeLead Connect</a></p>
  </>;

  return <AuthShell title="Welcome to HomeLead Connect" description="Sign in or create your HLC identity with the method that works best for you." status={status} footer={footer}>
    <div className="hlc-auth-method-tabs" role="tablist" aria-label="Sign-in method">
      <button type="button" onClick={() => { setMode("password"); resetStatus(); }} aria-pressed={mode === "password"}>Email + password</button>
      <button type="button" onClick={() => { setMode("magic"); resetStatus(); }} aria-pressed={mode === "magic"}>Email link</button>
      <button type="button" onClick={() => { setMode("phone"); resetStatus(); }} aria-pressed={mode === "phone"}>Phone</button>
    </div>

    {mode === "password" && <form className="hlc-auth-form" onSubmit={login}>
      <label>Email<input required autoComplete="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
      <label>Password<input required autoComplete="current-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
      <AuthTurnstile onToken={setCaptchaToken} resetSignal={captchaReset} />
      <button disabled={busy || !isSupabaseConfigured() || (turnstileEnabled && !captchaToken)} type="submit">{busy ? "Signing in…" : "Sign in to HLC"}</button>
    </form>}

    {mode === "magic" && <form className="hlc-auth-form" onSubmit={sendMagicLink}>
      <label>Email<input required autoComplete="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
      <AuthTurnstile onToken={setCaptchaToken} resetSignal={captchaReset} />
      <button disabled={busy || !isSupabaseConfigured() || (turnstileEnabled && !captchaToken)} type="submit">{busy ? "Sending…" : "Email me a secure sign-in link"}</button>
    </form>}

    {mode === "phone" && !otpSent && <form className="hlc-auth-form" onSubmit={sendPhoneOtp}>
      <label>Mobile number<input required autoComplete="tel" inputMode="tel" type="tel" placeholder="+17175550123" value={phone} onChange={(event) => setPhone(event.target.value)} /></label>
      <AuthTurnstile onToken={setCaptchaToken} resetSignal={captchaReset} />
      <button disabled={busy || !isSupabaseConfigured() || (turnstileEnabled && !captchaToken)} type="submit">{busy ? "Sending code…" : "Text me a sign-in code"}</button>
      <small>SMS sign-in activates when an HLC SMS authentication provider is configured in Supabase.</small>
    </form>}

    {mode === "phone" && otpSent && <form className="hlc-auth-form" onSubmit={verifyPhoneOtp}>
      <label>Verification code<input required inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]*" value={otp} onChange={(event) => setOtp(event.target.value)} /></label>
      <button disabled={busy || otp.trim().length < 6} type="submit">{busy ? "Verifying…" : "Verify and continue"}</button>
      <button type="button" onClick={() => { setOtpSent(false); setOtp(""); resetStatus(); }}>Use another number</button>
    </form>}

    <div className="hlc-auth-divider"><span>or continue with</span></div>
    <div className="hlc-auth-provider-grid">
      {oauthProviders.map(({ provider, label }) => <button type="button" key={provider} disabled={busy || !isSupabaseConfigured()} onClick={() => void oauth(provider)}>{label}</button>)}
    </div>
  </AuthShell>;
}
