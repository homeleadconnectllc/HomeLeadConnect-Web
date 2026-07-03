import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function Register(){

const[email,setEmail]=useState("");
const[password,setPassword]=useState("");

async function register(e:any){
e.preventDefault();

const {error}=await supabase.auth.signUp({
email,
password
});

if(error){
alert(error.message);
return;
}

alert("Check your email to verify your account.");
window.location.href="/login";
}

return(
<div style={{maxWidth:420,margin:"80px auto"}}>

<h1>Create Account</h1>

<form onSubmit={register}>

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

<button>Create Account</button>

</form>

</div>
);

}
