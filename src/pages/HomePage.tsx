import Footer from "../components/Footer";

const features = [
  ["Get Home Help", "Renters and homeowners can submit a service request and follow the work from one HLC account."],
  ["Find Providers", "Use the HLC network, matching, availability, profiles, and service-area tools."],
  ["Community", "Discussions, events, referrals, reviews, groups, and moderation live in the same ecosystem."],
  ["HLC Workspace", "Leads, LeadScope estimates, jobs, scheduling, messages, documents, workflows, analytics, and AI agents stay connected."],
];

const linkStyle = { color: "#bfdbfe", fontWeight: 800, textDecoration: "none" } as const;

export default function HomePage() {
  return <>
    <main className="hlc-home" style={{minHeight:"100vh",padding:"0 22px 48px",background:"#071426",color:"#f8fafc"}}>
      <header style={{position:"sticky",top:0,zIndex:20,maxWidth:1100,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",gap:16,padding:"14px 0",background:"rgba(7,20,38,.96)",borderBottom:"1px solid #28415f",backdropFilter:"blur(12px)"}}>
        <a href="/" aria-label="HomeLead Connect home" style={{display:"flex",alignItems:"center",gap:12,color:"#fff",textDecoration:"none",minWidth:0}}>
          <img src="/hlc-icon.jpeg" alt="" width={52} height={52} style={{width:52,height:52,objectFit:"contain",borderRadius:10}} />
          <span style={{fontWeight:900,fontSize:"clamp(18px,4vw,24px)",whiteSpace:"nowrap",overflow:"hidden",textOverflow:"ellipsis"}}>HomeLead Connect</span>
        </a>
        <a href="/app" style={{...linkStyle,padding:"10px 12px",border:"1px solid #365777",borderRadius:8}}>Open HLC</a>
      </header>

      <section className="hlc-home-hero" style={{maxWidth:1100,margin:"0 auto",textAlign:"center",padding:"clamp(48px,10vw,88px) 0 46px"}}>
        <img className="hlc-home-hero-logo" src="/hlc-icon.jpeg" alt="HomeLead Connect LLC" width={112} height={112} loading="eager" decoding="async" style={{width:112,height:112,objectFit:"contain",borderRadius:18}} />
        <p className="hlc-home-hero-kicker" style={{fontWeight:900,color:"#60a5fa",marginTop:22,letterSpacing:".05em"}}>HOMELEAD CONNECT</p>
        <h1 className="hlc-home-hero-title" style={{fontSize:"clamp(42px,8vw,80px)",lineHeight:1.02,letterSpacing:"-2.5px",margin:"12px auto 20px",color:"#f8fafc"}}>One front door.<br/>One connected home-services ecosystem.</h1>
        <p className="hlc-home-hero-copy" style={{maxWidth:760,margin:"0 auto",fontSize:"clamp(18px,4vw,21px)",lineHeight:1.6,color:"#b6c5d8"}}>Request help, connect with providers, join the community, manage work, and reach the HomeLead Connect workspace from one identity.</p>
        <div className="hlc-home-hero-actions" style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap",marginTop:28}}>
          <a href="/pricing" style={{padding:"13px 20px",borderRadius:8,background:"#2563eb",color:"#fff",fontWeight:900,textDecoration:"none"}}>Start 14-Day Free Trial</a>
          <a data-route-to="/request-service" href="/request-service" style={{padding:"13px 20px",borderRadius:8,background:"#112744",border:"1px solid #365777",color:"#fff",fontWeight:800,textDecoration:"none"}}>Get Help Now</a>
          <a data-route-to="/app" href="/app" style={{padding:"13px 20px",borderRadius:8,background:"transparent",border:"1px solid #365777",color:"#dbeafe",fontWeight:800,textDecoration:"none"}}>Open HomeLead Connect</a>
        </div>
        <p className="hlc-home-hero-note" style={{marginTop:14,color:"#9fb0c5",fontSize:14}}>For participating businesses: 14 days free, then $49.99/month. Payment method required.</p>
      </section>

      <section aria-label="HomeLead Connect capabilities" style={{maxWidth:1100,margin:"10px auto 58px",borderTop:"1px solid #28415f"}}>
        {features.map(([title,text]) => <article key={title} style={{display:"grid",gridTemplateColumns:"minmax(150px,.7fr) minmax(0,1.3fr)",gap:"18px 28px",alignItems:"start",padding:"24px 0",borderBottom:"1px solid #28415f",background:"transparent"}}>
          <h2 style={{fontSize:22,margin:0,color:"#f8fafc"}}>{title}</h2>
          <p style={{color:"#b6c5d8",lineHeight:1.65,margin:0}}>{text}</p>
        </article>)}
      </section>

      <section style={{maxWidth:1100,margin:"0 auto",padding:"34px 0",borderTop:"1px solid #28415f",borderBottom:"1px solid #28415f",textAlign:"center"}}>
        <p style={{margin:0,color:"#93c5fd",fontWeight:900,letterSpacing:".1em",fontSize:12}}>FOR BUSINESSES</p>
        <h2 style={{margin:"10px auto 12px",color:"#fff",fontSize:"clamp(28px,5vw,42px)"}}>Try the connected HLC workspace free for 14 days.</h2>
        <p style={{color:"#b6c5d8",lineHeight:1.65,maxWidth:760,margin:"0 auto"}}>Run leads, estimates, jobs, scheduling, messages, documents, workflow, analytics, and your HLC AI team from one workspace. Continue for $49.99/month after the trial.</p>
        <div style={{display:"flex",gap:14,justifyContent:"center",alignItems:"center",flexWrap:"wrap",marginTop:22}}>
          <a href="/pricing" style={{padding:"13px 20px",borderRadius:8,background:"#2563eb",color:"#fff",fontWeight:900,textDecoration:"none"}}>See Pricing & Start Trial</a>
          <a href="/login?next=/settings" style={linkStyle}>Manage existing subscription</a>
        </div>
      </section>

      <section style={{maxWidth:1100,margin:"0 auto",padding:"34px 0 12px",textAlign:"center"}}>
        <h2 style={{margin:"0 auto 12px",color:"#fff"}}>Everything branches from HomeLead Connect.</h2>
        <p style={{color:"#b6c5d8",lineHeight:1.65,maxWidth:860,margin:"0 auto"}}>Public information, service requests, authentication, resident and professional portals, Community, Network & Map, CRM operations, scheduling, communications, documents, billing, workflows, analytics, and the HLC AI team all belong to one connected system.</p>
        <div style={{display:"flex",gap:"12px 18px",justifyContent:"center",alignItems:"center",flexWrap:"wrap",marginTop:20}}>
          <a href="/pricing" style={linkStyle}>Pricing & free trial</a>
          <a href="/how-it-works" style={linkStyle}>How it works</a>
          <a data-route-to="/community" href="/community" style={linkStyle}>Community</a>
          <a href="/professionals" style={linkStyle}>For professionals</a>
          <a href="/trust" style={linkStyle}>Trust & safety</a>
          <a href="/contact" style={linkStyle}>Contact</a>
        </div>
      </section>
    </main>
    <Footer/>
  </>;
}
