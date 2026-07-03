import { supabase } from "../../lib/supabase";

export default function Dashboard() {
  async function logout() {
    await supabase.auth.signOut();
    window.location.href = "/";
  }

  return (
    <div style={{padding:"40px",fontFamily:"system-ui"}}>
      <h1>HomeLead Connect Dashboard</h1>
      <p>✅ Authentication Connected</p>
      <p>✅ Supabase Connected</p>
      <p>✅ Protected Route Ready</p>

      <button onClick={logout}>
        Logout
      </button>
    </div>
  );
}
