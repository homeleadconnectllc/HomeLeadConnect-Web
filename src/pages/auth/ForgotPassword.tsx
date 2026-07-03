import { useState } from "react";
import { supabase } from "../../lib/supabase";

export default function ForgotPassword(){

const[email,setEmail]=useState("");

async function send(e:any){
e.preventDefault();

const {error}=await supabase.auth.resetPasswordForEmail(email);

if(error){
alert(error.message);
return;
}

alert("Password reset email sent.");
}

return(
<div style={{maxWidth:420,margin:"80px auto"}}>

<h1>Forgot Password</h1>

<form onSubmit={send}>

<input
type="email"
placeholder="Email"
value={email}
onChange={e=>setEmail(e.target.value)}
/>

<br/><br/>

<button>Send Reset Email</button>

</form>

</div>
);

}
