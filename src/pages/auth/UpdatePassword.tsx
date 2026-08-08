import { useState } from "react";
import type { FormEvent } from "react";import { useNavigate } from "react-router-dom";
import { supabase } from "../../lib/supabase";

export default function UpdatePassword() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function updatePassword(e: FormEvent) {
    e.preventDefault();
    setError("");
    setMessage("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    const { error } = await supabase.auth.updateUser({ password });

    if (error) {
      setError(error.message);
      return;
    }

    setMessage("Password updated successfully.");

    setTimeout(() => {
      navigate("/dashboard");
    }, 1000);
  }

  return (
    <div style={{ maxWidth: 420, margin: "80px auto" }}>
      <h1>Update Password</h1>

      <form onSubmit={updatePassword}>
        <input
          type="password"
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          minLength={8}
          required
        />

        <br />
        <br />

        <input
          type="password"
          placeholder="Confirm new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          minLength={8}
          required
        />

        <br />
        <br />

        <button type="submit">Update Password</button>
      </form>

      {message && <p>{message}</p>}
      {error && <p>{error}</p>}
    </div>
  );
}
