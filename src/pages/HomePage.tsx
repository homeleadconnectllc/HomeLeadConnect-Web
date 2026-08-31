import heroImage from "../assets/hero.png";
import Footer from "../components/Footer";

const steps = [
  ["01", "Request", "Tell HLC what your household needs."],
  ["02", "Review", "We review the need and the details you shared."],
  ["03", "Connect", "HLC helps connect the request to the right next path."],
  ["04", "Coordinate", "Scheduling and next steps are confirmed separately."],
] as const;

const audiences = [
  { eyebrow: "FOR RESIDENTS", title: "Home help without the runaround.", body: "Renters and homeowners can start one clear request, keep household context visible, and follow the next step from one connected HLC experience.", link: "/request-service", action: "Request home service" },
  { eyebrow: "FOR PROFESSIONALS", title: "A clearer path to opportunity.", body: "Contractors, trades, movers, cleaners, painters, roofers, HVAC teams, and other service professionals can participate in an organized HLC network.", link: "/professionals", action: "Explore the professional network" },
] as const;

export default function HomePage() {
  return <>
    <main className="hlc-home-v2">
      <style>{css}</style>
      <section className="hlc-home-hero-v2">
        <div className="hlc-home-hero-copy-v2">
          <p className="hlc-home-kicker">HOMELEAD CONNECT</p>
          <h1>Start with the home need. We help connect the next step.</h1>
          <p className="hlc-home-lead">HomeLead Connect gives renters, households, homeowners, and participating service professionals one organized place to begin, connect, and coordinate home-service needs.</p>
          <div className="hlc-home-actions">
            <a className="hlc-btn hlc-btn-primary" href="/request-service" data-route-to="/request-service">Request Home Service</a>
            <a className="hlc-btn hlc-btn-secondary" href="/professionals">For Professionals</a>
          </div>
          <div className="hlc-home-utility-links"><a href="/login">Sign In</a><a href="/register">Create My HLC Account</a><a href="/contact">Contact HLC</a></div>
        </div>
        <div className="hlc-home-hero-visual" aria-label="HomeLead Connect home-service connection">
          <img src={heroImage} alt="A connected home-service experience" />
          <div className="hlc-home-visual-note"><img src="/hlc-logo-transparent.png" alt=""/><span><strong>One front door</strong><small>Request · Review · Connect · Coordinate</small></span></div>
        </div>
      </section>

      <section className="hlc-home-section hlc-home-connection" aria-labelledby="connection-title">
        <div><p className="hlc-home-kicker">WHO HLC CONNECTS</p><h2 id="connection-title">Households and service professionals, with HLC in the middle.</h2></div>
        <div className="hlc-connection-flow" aria-label="Resident to HLC to professional connection">
          <div><span className="hlc-flow-icon">⌂</span><strong>Resident</strong><small>Starts the need</small></div><span className="hlc-flow-arrow">→</span>
          <div className="hlc-flow-hlc"><img src="/hlc-logo-transparent.png" alt=""/><strong>HomeLead Connect</strong><small>Reviews & coordinates</small></div><span className="hlc-flow-arrow">→</span>
          <div><span className="hlc-flow-icon">⚒</span><strong>Professional</strong><small>Participates in service</small></div>
        </div>
      </section>

      <section className="hlc-home-section" aria-labelledby="how-title">
        <p className="hlc-home-kicker">HOW IT WORKS</p><h2 id="how-title">A simple path from request to next step.</h2>
        <div className="hlc-home-steps">{steps.map(([n,title,body])=><article key={n}><span>{n}</span><div><h3>{title}</h3><p>{body}</p></div></article>)}</div>
      </section>

      <section className="hlc-home-section hlc-audience-grid" aria-label="HomeLead Connect audiences">
        {audiences.map((item,index)=><article key={item.eyebrow} className="hlc-audience-card"><div className={`hlc-audience-visual hlc-audience-visual-${index+1}`} aria-hidden="true"><span>{index===0?"HOME HELP":"SERVICE NETWORK"}</span></div><div><p className="hlc-home-kicker">{item.eyebrow}</p><h2>{item.title}</h2><p>{item.body}</p><a href={item.link}>{item.action} →</a></div></article>)}
      </section>

      <section className="hlc-home-section hlc-platform-section">
        <div><p className="hlc-home-kicker">CONNECTED PLATFORM</p><h2>The service experience and the workspace belong to one system.</h2><p>Participating businesses can manage leads, estimates, jobs, scheduling, messages, documents, workflows, analytics, and HLC AI support without turning the public homepage into software documentation.</p><div className="hlc-home-actions"><a className="hlc-btn hlc-btn-secondary" href="/how-it-works">See how HLC works</a><a className="hlc-btn hlc-btn-secondary" href="/pricing">Business pricing</a></div></div>
        <div className="hlc-platform-visual" aria-label="Connected HLC workspace"><span>REQUEST</span><span>LEAD</span><span>SCHEDULE</span><span>JOB</span><span>MESSAGE</span><span>COMPLETE</span></div>
      </section>

      <section className="hlc-home-section hlc-trust-section">
        <div><p className="hlc-home-kicker">COMMUNITY & TRUST</p><h2>Clear expectations matter as much as the connection.</h2><p>HLC keeps requests, communication, community, and provider participation connected while keeping assignment, pricing, and appointment confirmation explicit.</p></div>
        <div className="hlc-trust-links"><a href="/community">Community</a><a href="/trust">Trust & safety</a><a href="/about">About HLC</a></div>
      </section>

      <section className="hlc-home-section hlc-business-strip">
        <div><p className="hlc-home-kicker">FOR PARTICIPATING BUSINESSES</p><h2>Try the connected HLC workspace free for 14 days.</h2><p>Continue for $49.99/month after the trial. Payment method required.</p></div><a className="hlc-btn hlc-btn-primary" href="/register">Start 14-Day Free Trial</a>
      </section>
    </main>
    <Footer />
  </>;
}

const css=`
.hlc-home-v2{min-height:100vh;background:#07111f;color:#eef5ff;padding:0 22px 44px}.hlc-home-v2 *{box-sizing:border-box}.hlc-home-v2 a{color:#bfdbfe}.hlc-home-hero-v2,.hlc-home-section{width:min(1120px,100%);margin:0 auto}.hlc-home-hero-v2{display:grid;grid-template-columns:minmax(0,1.02fr) minmax(340px,.98fr);gap:42px;align-items:center;padding:72px 0 58px}.hlc-home-kicker{margin:0 0 12px;color:#77b7ff!important;font-size:12px;font-weight:950;letter-spacing:.15em}.hlc-home-hero-copy-v2 h1{margin:0;color:#fff;font-size:clamp(2.6rem,6vw,5rem);line-height:.98;letter-spacing:-.045em}.hlc-home-lead{margin:22px 0 0;color:#c4d1e2!important;font-size:clamp(17px,2vw,21px);line-height:1.65;max-width:700px}.hlc-home-actions{display:flex;gap:12px;flex-wrap:wrap;margin-top:26px}.hlc-btn{display:inline-flex;min-height:50px;align-items:center;justify-content:center;padding:12px 20px;border-radius:6px;text-decoration:none;font-weight:900}.hlc-btn-primary{background:linear-gradient(135deg,#2563eb,#1689e8);color:#fff!important}.hlc-btn-secondary{border:1px solid #355574;background:#10233d;color:#e4efff!important}.hlc-home-utility-links{display:flex;gap:18px;flex-wrap:wrap;margin-top:18px}.hlc-home-utility-links a{font-size:14px}.hlc-home-hero-visual{position:relative;min-height:420px;border:1px solid #294767;background:radial-gradient(circle at 80% 10%,rgba(56,189,248,.2),transparent 35%),#0a1a2e;overflow:hidden}.hlc-home-hero-visual>img{width:100%;height:420px;display:block;object-fit:cover;opacity:.9}.hlc-home-visual-note{position:absolute;left:18px;right:18px;bottom:18px;display:flex;align-items:center;gap:12px;padding:14px;background:rgba(5,15,28,.9);border:1px solid rgba(147,197,253,.28);backdrop-filter:blur(10px)}.hlc-home-visual-note img{width:46px;height:46px;object-fit:contain}.hlc-home-visual-note span{display:grid;gap:3px}.hlc-home-visual-note small{color:#afc2d8}.hlc-home-section{padding:56px 0;border-top:1px solid #203753}.hlc-home-section>h2,.hlc-home-section>div>h2,.hlc-audience-card h2{margin:0;color:#fff;font-size:clamp(1.8rem,4vw,3.1rem);line-height:1.05;letter-spacing:-.025em}.hlc-home-section p{color:#bccadd;line-height:1.65}.hlc-home-connection{display:grid;grid-template-columns:.78fr 1.22fr;gap:34px;align-items:center}.hlc-connection-flow{display:grid;grid-template-columns:1fr auto 1.15fr auto 1fr;gap:10px;align-items:center}.hlc-connection-flow>div{min-height:150px;padding:18px 12px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;border:1px solid #2c4968;background:#0b1a2c}.hlc-connection-flow strong{margin-top:8px}.hlc-connection-flow small{margin-top:4px;color:#9fb0c5}.hlc-flow-icon{font-size:32px}.hlc-flow-hlc img{width:54px;height:54px;object-fit:contain}.hlc-flow-arrow{color:#60a5fa;font-weight:900}.hlc-home-steps{display:grid;grid-template-columns:repeat(4,1fr);gap:10px;margin-top:24px}.hlc-home-steps article{display:flex;gap:12px;padding:18px;border:1px solid #284563;background:#0a192b}.hlc-home-steps article>span{flex:0 0 32px;width:32px;height:32px;display:grid;place-items:center;border-radius:999px;background:#1689e8;font-size:11px;font-weight:950}.hlc-home-steps h3{margin:2px 0 4px;color:#fff}.hlc-home-steps p{margin:0;font-size:14px}.hlc-audience-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px}.hlc-audience-card{overflow:hidden;border:1px solid #284563;background:#091827}.hlc-audience-card>div:last-child{padding:24px}.hlc-audience-card p{margin-bottom:18px}.hlc-audience-card a{font-weight:900}.hlc-audience-visual{height:185px;display:flex;align-items:flex-end;padding:18px;background-size:cover;background-position:center;position:relative}.hlc-audience-visual::before{content:"";position:absolute;inset:0;background:linear-gradient(180deg,rgba(4,12,23,.05),rgba(4,12,23,.78))}.hlc-audience-visual span{position:relative;font-weight:950;letter-spacing:.12em;font-size:12px}.hlc-audience-visual-1{background-image:linear-gradient(135deg,rgba(37,99,235,.2),rgba(14,165,233,.08)),url('/hlc-logo-final.png');background-size:cover,210px;background-repeat:no-repeat;background-position:center}.hlc-audience-visual-2{background-image:radial-gradient(circle at 25% 40%,rgba(56,189,248,.35),transparent 20%),linear-gradient(135deg,#102c4b,#07111f)}.hlc-platform-section{display:grid;grid-template-columns:1fr .9fr;gap:30px;align-items:center}.hlc-platform-section p{max-width:680px}.hlc-platform-visual{display:grid;grid-template-columns:repeat(2,1fr);gap:8px}.hlc-platform-visual span{min-height:72px;display:grid;place-items:center;border:1px solid #315373;background:#0c2037;color:#dbeafe;font-size:12px;font-weight:950;letter-spacing:.08em}.hlc-trust-section{display:flex;align-items:flex-end;justify-content:space-between;gap:26px}.hlc-trust-section>div:first-child{max-width:720px}.hlc-trust-links{display:flex;gap:14px;flex-wrap:wrap}.hlc-trust-links a{font-weight:900}.hlc-business-strip{display:flex;align-items:center;justify-content:space-between;gap:24px}.hlc-business-strip h2{font-size:clamp(1.6rem,3vw,2.4rem)!important}.hlc-business-strip p{margin-bottom:0}
@media(max-width:760px){.hlc-home-v2{padding:0 16px 32px}.hlc-home-hero-v2{grid-template-columns:1fr;gap:24px;padding:34px 0 42px}.hlc-home-hero-copy-v2{text-align:left}.hlc-home-hero-copy-v2 h1{font-size:2.65rem;line-height:1.01}.hlc-home-actions{display:grid;grid-template-columns:1fr}.hlc-home-utility-links{justify-content:flex-start}.hlc-home-hero-visual{min-height:250px}.hlc-home-hero-visual>img{height:250px}.hlc-home-section{padding:42px 0}.hlc-home-connection,.hlc-platform-section{grid-template-columns:1fr}.hlc-connection-flow{grid-template-columns:1fr}.hlc-flow-arrow{transform:rotate(90deg);text-align:center}.hlc-home-steps{grid-template-columns:1fr}.hlc-home-steps article{align-items:flex-start}.hlc-audience-grid{grid-template-columns:1fr}.hlc-audience-visual{height:150px}.hlc-trust-section,.hlc-business-strip{align-items:flex-start;flex-direction:column}.hlc-platform-visual{grid-template-columns:repeat(3,1fr)}}
`;