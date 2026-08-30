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

const phoneAuthEnabled = import.meta.env.VITE_PHONE_AUTH_ENABLED === "true";
const socialAuthEnabled = import.meta.env.VITE_SOCIAL_AUTH_ENABLED === "true";
const SIGN_IN_TIMEOUT_MS = 15_000;

const oauthProviders: Array<{ provider: Provider; label: string }> = [
  { provider: "google", label: "Continue with Google" },
  { provider: "apple", label: "Continue with Apple" },
  { provider: "facebook", label: "Continue with Facebook" },
];

function safeNext(search: string) {
  const raw = new URLSearchParams(search).get("next")?.trim() || "";
  return raw.startsWith("/") && !raw.startsWith("//") ? raw : null;
}

function withTimeout<T>(promise: PromiseLike<T>, timeoutMs: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(() => reject(new Error("HLC_SIGN_IN_TIMEOUT")), timeoutMs);
    Promise.resolve(promise).then(
      (value) => { window.clearTimeout(timeoutId); resolve(value); },
      (reason) => { window.clearTimeout(timeoutId); reject(reason); },
    );
  });
}

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
  const queryNext = safeNext(location.search);
  const invitationFlow = Boolean(queryNext?.startsWith("/team/accept?"));

  if (!loading && session) return <Navigate to={queryNext || "/app"} replace />;

  function resetStatus() { setError(""); setMessage(""); }
  function resetCaptcha() { setCaptchaToken(""); setCaptchaReset((value) => value + 1); }
  function destination() {
    const requested = (location.state as { from?: string } | null)?.from;
    return queryNext || (requested?.startsWith("/") && !requested.startsWith("//") ? requested : null) || "/app";
  }

  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    trackAnalyticsEvent("sign_in_started", { method: "password" });
    setBusy(true); resetStatus();
    if (!isSupabaseConfigured()) { setError(supabaseConfigMessage); setBusy(false); return; }

    try {
      const { error: authError } = await withTimeout(
        supabase.auth.signInWithPassword({ email, password, options: { captchaToken: captchaToken || undefined } }),
        SIGN_IN_TIMEOUT_MS,
      );
      resetCaptcha();
      if (authError) { setError(errorMessage(authError, "Unable to sign in.")); return; }
      trackAnalyticsEvent("sign_in_completed", { method: "password" });
      navigate(destination(), { replace: true });
    } catch (authError) {
      resetCaptcha();
      if (authError instanceof Error && authError.message === "HLC_SIGN_IN_TIMEOUT") {
        setError("Sign-in took too long. Check your connection and try again.");
      } else {
        setError(errorMessage(authError, "Unable to sign in. Please try again."));
      }
    } finally {
      setBusy(false);
    }
  }

  async function sendMagicLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    trackAnalyticsEvent("sign_in_started", { method: "email_link" });
    setBusy(true); resetStatus();
    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: { shouldCreateUser: !invitationFlow, emailRedirectTo: `${window.location.origin}${destination()}`, captchaToken: captchaToken || undefined },
    });
    resetCaptcha(); setBusy(false);
    if (authError) { setError(errorMessage(authError, "Unable to send the sign-in link.")); return; }
    setMessage(invitationFlow ? "If this HLC identity already exists, check your email for the secure sign-in link. Otherwise use Create your account below." : "Check your email for your HomeLead Connect sign-in link.");
  }

  async function sendPhoneOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!phoneAuthEnabled || invitationFlow) return;
    trackAnalyticsEvent("sign_in_started", { method: "phone_otp" });
    setBusy(true); resetStatus();
    const normalized = phone.trim();
    if (!normalized.startsWith("+")) { setError("Enter the phone number in international format, for example +17175550123."); setBusy(false); return; }
    const { error: authError } = await supabase.auth.signInWithOtp({ phone: normalized, options: { shouldCreateUser: true, captchaToken: captchaToken || undefined } });
    resetCaptcha(); setBusy(false);
    if (authError) { setError(errorMessage(authError, "Phone sign-in is not available yet or the code could not be sent.")); return; }
    setOtpSent(true); setMessage("Enter the verification code sent to your phone.");
  }

  async function verifyPhoneOtp(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!phoneAuthEnabled || invitationFlow) return;
    setBusy(true); resetStatus();
    const { error: authError } = await supabase.auth.verifyOtp({ phone: phone.trim(), token: otp.trim(), type: "sms" });
    setBusy(false);
    if (authError) { setError(errorMessage(authError, "Unable to verify that code.")); return; }
    trackAnalyticsEvent("sign_in_completed", { method: "phone_otp" });
    navigate(destination(), { replace: true });
  }

  async function oauth(provider: Provider) {
    if (!socialAuthEnabled || invitationFlow) return;
    trackAnalyticsEvent("sign_in_started", { method: provider });
    setBusy(true); resetStatus();
    const { error: authError } = await supabase.auth.signInWithOAuth({ provider, options: { redirectTo: `${window.location.origin}${destination()}` } });
    if (authError) { setError(errorMessage(authError, `${provider} sign-in is not configured for HLC yet.`)); setBusy(false); }
  }

  const status = <>
    {(error || !isSupabaseConfigured()) && <p role="alert" style={{ color: "#b91c1c" }}>{error || supabaseConfigMessage}</p>}
    {message && <p role="status" style={{ color: "#166534" }}>{message}</p>}
  </>;
  const registerHref = queryNext ? `/register?next=${encodeURIComponent(queryNext)}` : "/register";
  const footer = <>
    <p><Link to="/forgot-password">Forgot your password?</Link></p>
    <p>New to HLC? <Link to={registerHref}>Create your account</Link>.</p>
    <p><a href="https://homeleadconnect.org">Return to HomeLead Connect</a></p>
  </>;

  return <AuthShell title="Welcome to HomeLead Connect" description={invitationFlow ? "Sign in with the email address that received the company invitation." : "Sign in or create your HLC identity with the method that works best for you."} status={status} footer={footer}>
    <div className="hlc-auth-method-tabs" role="tablist" aria-label="Sign-in method">
      <button type="button" onClick={() => { setMode("password"); resetStatus(); }} aria-pressed={mode === "password"}>Email + password</button>
      <button type="button" onClick={() => { setMode("magic"); resetStatus(); }} aria-pressed={mode === "magic"}>Email link</button>
      {phoneAuthEnabled && !invitationFlow && <button type="button" onClick={() => { setMode("phone"); resetStatus(); }} aria-pressed={mode === "phone"}>Phone</button>}
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

    {phoneAuthEnabled && !invitationFlow && mode === "phone" && !otpSent && <form className="hlc-auth-form" onSubmit={sendPhoneOtp}>
      <label>Mobile number<input required autoComplete="tel" inputMode="tel" type="tel" placeholder="+17175550123" value={phone} onChange={(event) => setPhone(event.target.value)} /></label>
      <AuthTurnstile onToken={setCaptchaToken} resetSignal={captchaReset} />
      <button disabled={busy || !isSupabaseConfigured() || (turnstileEnabled && !captchaToken)} type="submit">{busy ? "Sending code…" : "Text me a sign-in code"}</button>
    </form>}

    {phoneAuthEnabled && !invitationFlow && mode === "phone" && otpSent && <form className="hlc-auth-form" onSubmit={verifyPhoneOtp}>
      <label>Verification code<input required inputMode="numeric" autoComplete="one-time-code" pattern="[0-9]*" value={otp} onChange={(event) => setOtp(event.target.value)} /></label>
      <button disabled={busy || otp.trim().length < 6} type="submit">{busy ? "Verifying…" : "Verify and continue"}</button>
      <button type="button" onClick={() => { setOtpSent(false); setOtp(""); resetStatus(); }}>Use another number</button>
    </form>}

    {socialAuthEnabled && !invitationFlow && <>
      <div className="hlc-auth-divider"><span>or continue with</span></div>
      <div className="hlc-auth-provider-grid">
        {oauthProviders.map(({ provider, label }) => <button type="button" key={provider} disabled={busy || !isSupabaseConfigured()} onClick={() => void oauth(provider)}>{label}</button>)}
      </div>
    </>}
  </AuthShell>;
}
