import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function login(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
      return;
    }

    window.location.href = "/dashboard";
  }

  async function loginWithGitHub() {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });

    if (error) {
      alert(error.message);
    }
  }

  return (
    <div style={{ maxWidth: 420, margin: "80px auto" }}>
      <h1>Login</h1>

      <button type="button" onClick={loginWithGitHub}>
        Continue with GitHub
      </button>

      <br />
      <br />

      <form onSubmit={login}>
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <br />
        <br />

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <br />
        <br />

        <button type="submit">Login</button>
      </form>
    </div>
  );
}
