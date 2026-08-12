import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import AuthShell from "../../components/auth/AuthShell";
import { errorMessage } from "../../lib/errorMessage";
import { supabase } from "../../lib/supabase";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function update(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError(""); setMessage("");
    const { error: authError } = await supabase.auth.updateUser({ password });
    setBusy(false);
    if (authError) { setError(errorMessage(authError, "Unable to update the password.")); return; }
    setMessage("Password updated. Your same HLC account is ready.");
  }

  const status = <>
    {error && <p role="alert" style={{ color: "#b91c1c" }}>{error}</p>}
    {message && <p role="status" style={{ color: "#166534" }}>{message}</p>}
  </>;
  const footer = message
    ? <p><Link to="/dashboard">Continue to your HLC dashboard</Link></p>
    : <p><Link to="/login">Return to sign in</Link></p>;

  return <AuthShell title="Choose a new password" description="Update the password for your existing HomeLead Connect account." status={status} footer={footer}>
    <form className="hlc-auth-form" onSubmit={update}>
      <label>New password<input required minLength={8} autoComplete="new-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
      <button disabled={busy} type="submit">{busy ? "Updating…" : "Update HLC password"}</button>
    </form>
  </AuthShell>;
}
