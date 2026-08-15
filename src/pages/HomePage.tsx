import { Link } from "react-router-dom";
import Footer from "../components/Footer";

const features = [
  ["Get Home Help", "Renters and homeowners can submit a service request and follow the work from one HLC account."],
  ["Find Providers", "Use the HLC network, matching, availability, profiles, and service-area tools."],
  ["Community", "Discussions, events, referrals, reviews, groups, and moderation live in the same ecosystem."],
  ["HLC Workspace", "Leads, LeadScope estimates, jobs, scheduling, messages, documents, workflows, analytics, and AI agents stay connected."],
];

export default function HomePage() {
  return <>
    <main className="hlc-home" style={{minHeight:"100vh",padding:"40px 24px",background:"linear-gradient(135deg,#ffffff 0%,#eff6ff 45%,#dbeafe 100%)",color:"#0f172a"}}>
      <section style={{maxWidth:1100,margin:"0 auto",textAlign:"center",padding:"72px 0 48px"}}>
        <img src="/hlc-logo-final.png" alt="HomeLead Connect LLC" style={{width:120,height:120,objectFit:"contain",borderRadius:24,background:"#fff",padding:14,boxShadow:"0 20px 60px rgba(15,23,42,.14)"}} />
        <p style={{fontWeight:800,color:"#2563eb",marginTop:28}}>HOMELEAD CONNECT</p>
        <h1 style={{fontSize:"clamp(44px,8vw,84px)",lineHeight:1,letterSpacing:"-3px",margin:"14px auto 22px",color:"#0f172a",textShadow:"0 1px 0 rgba(255,255,255,.35)"}}>One front door.<br/>One connected home-services ecosystem.</h1>
        <p style={{maxWidth:760,margin:"0 auto",fontSize:21,lineHeight:1.6,color:"#475569"}}>Request help, connect with providers, join the community, manage work, and reach the HomeLead Connect workspace from one identity.</p>
        <div style={{display:"flex",gap:14,justifyContent:"center",flexWrap:"wrap",marginTop:32}}>
          <Link to="/pricing" style={{padding:"14px 22px",borderRadius:999,background:"#2563eb",color:"#fff",fontWeight:900,textDecoration:"none",boxShadow:"0 12px 30px rgba(37,99,235,.22)"}}>Start 14-Day Free Trial</Link>
          <Link to="/request-service" style={{padding:"14px 22px",borderRadius:999,background:"#0f172a",color:"#fff",fontWeight:800,textDecoration:"none"}}>Get Help Now</Link>
          <Link to="/app" style={{padding:"14px 22px",borderRadius:999,background:"#fff",color:"#0f172a",fontWeight:800,textDecoration:"none",border:"1px solid #cbd5e1"}}>Open HomeLead Connect</Link>
        </div>
        <p style={{marginTop:14,color:"#64748b",fontSize:14}}>For participating businesses: 14 days free, then $49.99/month. Payment method required.</p>
      </section>

      <section style={{maxWidth:1100,margin:"20px auto 72px",display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(230px,1fr))",gap:20}}>
        {features.map(([title,text]) => <article key={title} style={{background:"#fff",color:"#0f172a",borderRadius:24,padding:28,boxShadow:"0 18px 50px rgba(15,23,42,.08)"}}>
          <h2 style={{fontSize:22,marginTop:0,color:"#0f172a"}}>{title}</h2>
          <p style={{color:"#475569",lineHeight:1.6}}>{text}</p>
        </article>)}
      </section>

      <section style={{maxWidth:1100,margin:"0 auto 28px",background:"linear-gradient(145deg,#07111f,#0b2345 60%,#0b3b51)",color:"#fff",borderRadius:32,padding:"clamp(28px,5vw,44px)",textAlign:"center",boxShadow:"0 24px 70px rgba(15,23,42,.16)"}}>
        <p style={{margin:0,color:"#93c5fd",fontWeight:900,letterSpacing:".1em",fontSize:12}}>FOR BUSINESSES</p>
        <h2 style={{margin:"10px auto 12px",color:"#fff",fontSize:"clamp(28px,5vw,42px)"}}>Try the connected HLC workspace free for 14 days.</h2>
        <p style={{color:"#cbd5e1",lineHeight:1.65,maxWidth:760,margin:"0 auto"}}>Run leads, estimates, jobs, scheduling, messages, documents, workflow, analytics, and your HLC AI team from one workspace. Continue for $49.99/month after the trial.</p>
        <div style={{display:"flex",gap:14,justifyContent:"center",alignItems:"center",flexWrap:"wrap",marginTop:24}}>
          <Link to="/pricing" style={{padding:"14px 22px",borderRadius:12,background:"#2563eb",color:"#fff",fontWeight:900,textDecoration:"none"}}>See Pricing & Start Trial</Link>
          <Link to="/login?next=/settings" style={{color:"#dbeafe",fontWeight:800}}>Manage existing subscription</Link>
        </div>
      </section>

      <section style={{maxWidth:1100,margin:"0 auto 60px",background:"#0f172a",color:"#fff",borderRadius:32,padding:34,textAlign:"center"}}>
        <h2 style={{margin:"0 auto 14px",color:"#fff"}}>Everything branches from HomeLeadConnect.org</h2>
        <p style={{color:"#cbd5e1",lineHeight:1.6,maxWidth:860,margin:"0 auto"}}>Public information, service requests, authentication, homeowner and contractor portals, Community, Network & Map, CRM operations, scheduling, communications, documents, billing, workflows, analytics, and Kendrell, Dion, and Diamond all belong to the same HLC route tree and Supabase-backed system.</p>
        <div style={{display:"flex",gap:16,justifyContent:"center",alignItems:"center",flexWrap:"wrap",marginTop:22}}>
          <Link to="/pricing" style={{color:"#bfdbfe",fontWeight:800}}>Pricing & free trial</Link>
          <Link to="/how-it-works" style={{color:"#bfdbfe"}}>How it works</Link>
          <Link to="/community" style={{color:"#bfdbfe"}}>Community</Link>
          <Link to="/professionals" style={{color:"#bfdbfe"}}>For professionals</Link>
          <Link to="/trust" style={{color:"#bfdbfe"}}>Trust & safety</Link>
          <Link to="/contact" style={{color:"#bfdbfe"}}>Contact</Link>
        </div>
      </section>
    </main>
    <Footer/>
  </>;
}
