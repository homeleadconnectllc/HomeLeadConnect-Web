import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Login() {
  const [email,setEmail]=useState("");
  const [password,setPassword]=useState("");

  async function login(e:any){
    e.preventDefault();

    const {error}=await supabase.auth.signInWithPassword({
      email,
      password
    });

    if(error){
      alert(error.message);
      return;
    }

    window.location.href="/dashboard";
  }

  return(
    <div style={{maxWidth:420,margin:"80px auto"}}>
      <h1>Login</h1>

      <form onSubmit={login}>
        <input
          placeholder="Email"
          type="email"
          value={email}
          onChange={e=>setEmail(e.target.value)}
        />

        <br/><br/>

        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={e=>setPassword(e.target.value)}
        />

        <br/><br/>

        <button>Login</button>
      </form>
    </div>
  );
}
