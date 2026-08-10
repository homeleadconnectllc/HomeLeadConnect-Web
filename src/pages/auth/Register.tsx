import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { errorMessage } from "../../lib/errorMessage";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function register(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: { emailRedirectTo: `${window.location.origin}/login` },
    });
    setBusy(false);
    if (authError) { setError(errorMessage(authError, "Unable to create the account.")); return; }
    setMessage("Account created. Check your email for the confirmation link before signing in.");
  }

  return <main style={pageStyle}>
    <h1>Create account</h1>
    {error && <p role="alert" style={{ color: "#b91c1c" }}>{error}</p>}
    {message && <p role="status" style={{ color: "#166534" }}>{message}</p>}
    <form onSubmit={register} style={formStyle}>
      <label>Email<input required autoComplete="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} /></label>
      <label>Password<input required minLength={8} autoComplete="new-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
      <button disabled={busy} type="submit">{busy ? "Creating account…" : "Create account"}</button>
    </form>
    <p>Already registered? <Link to="/login">Sign in</Link>.</p>
  </main>;
}

const pageStyle = { width: "min(420px, calc(100% - 32px))", margin: "64px auto" };
const formStyle = { display: "grid", gap: 16 };
