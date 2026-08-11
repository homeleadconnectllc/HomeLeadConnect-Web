import { useState, type FormEvent } from "react";
import { Link } from "react-router-dom";
import { supabase } from "../../lib/supabase";
import { errorMessage } from "../../lib/errorMessage";

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
    setMessage("Password updated. You can now continue to the dashboard.");
  }

  return <main className="hlc-auth-page" style={pageStyle}>
    <h1>Choose a new password</h1>
    {error && <p role="alert" style={{ color: "#b91c1c" }}>{error}</p>}
    {message && <p role="status" style={{ color: "#166534" }}>{message}</p>}
    <form className="hlc-auth-form" onSubmit={update} style={formStyle}>
      <label>New password<input required minLength={8} autoComplete="new-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} /></label>
      <button disabled={busy} type="submit">{busy ? "Updating…" : "Update password"}</button>
    </form>
    {message && <p><Link to="/dashboard">Continue to dashboard</Link></p>}
  </main>;
}

const pageStyle = { width: "min(420px, calc(100% - 32px))", margin: "64px auto" };
const formStyle = { display: "grid", gap: 16 };
