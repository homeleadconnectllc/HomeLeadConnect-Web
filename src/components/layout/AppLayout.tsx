import type { ReactNode } from "react";
import { Link } from "react-router-dom";

export default function AppLayout({
  children
}: {
  children:ReactNode
}) {

return (
<div style={{
minHeight:"100vh",
display:"flex",
background:"#020617",
color:"#fff"
}}>

<aside style={{
width:"260px",
background:"#0f172a",
padding:"25px",
borderRight:"1px solid #1e293b"
}}>

<h2 style={{
color:"#60a5fa",
marginBottom:"35px"
}}>
HomeLead Connect
</h2>

<p style={{color:"#94a3b8"}}>
Enterprise Home Services Platform
</p>

<nav style={{
display:"flex",
flexDirection:"column",
gap:"18px",
marginTop:"35px"
}}>

<Link to="/dashboard">🏠 Dashboard</Link>
<Link to="/profile">👤 Profile</Link>
<Link to="/messages">💬 Messages</Link>
<Link to="/calendar">📅 Calendar</Link>

</nav>

</aside>


<div style={{
flex:1
}}>

<header style={{
height:"70px",
background:"#111827",
borderBottom:"1px solid #1e293b",
display:"flex",
alignItems:"center",
justifyContent:"space-between",
padding:"0 30px"
}}>

<h3>
Operations Center
</h3>

<span style={{
color:"#60a5fa"
}}>
Connected
</span>

</header>


<main style={{
padding:"35px"
}}>
{children}
</main>


</div>

</div>
)

}
