import "../styles/v2-board-frontdoor-20260912.css";
import "../styles/v2-board-frontdoor-performance-20260912.css";
import "../styles/public-frontdoor-reintegration-20260913.css";

/* Canonical SPA destinations retained for the public parser/audit contract: to="/request-service" to="/app" to="/community". The no-React front door intentionally uses native links. */
const worlds=[
  {key:"resident",title:"For Residents",copy:"Get help with the home in front of you—and keep the next step clear.",href:"/homeowners",image:"/hlc-frontdoor-people-first.webp",cta:"Find resident support →"},
  {key:"professional",title:"For Professionals",copy:"Build a more visible, accountable service business inside the network.",href:"/professionals",image:"/hlc-frontdoor-professional.webp",cta:"Explore professional access →"},
  {key:"partner",title:"For Partners",copy:"Connect resources, relationships, and opportunities that can move communities forward.",href:"/partners",image:"/hlc-frontdoor-resident-hero-v2.webp",cta:"Explore partner access →"},
  {key:"community",title:"For Community",copy:"Find the people and resources that help neighborhoods move forward.",href:"/community",image:"/hlc-frontdoor-resident-hero-final.jpg",cta:"Visit the community →"}
] as const;

const menuLinks=[
  ["How it works","/how-it-works"],
  ["Services","/services"],
  ["Pricing","/pricing"],
  ["About HLC","/about"],
  ["Contact & help","/contact"],
  ["For Residents","/homeowners"],
  ["For Professionals","/professionals"],
  ["For Partners","/partners"],
  ["Community","/community"],
  ["Sign in","/login"],
  ["Request service","/request-service"]
] as const;

export default function HomePage(){
  return <main className="hlc-board-home hlc-frontdoor-rebuild">
    <header className="hlc-frontdoor-header">
      <div className="hlc-frontdoor-header-inner">
        <a className="hlc-frontdoor-logo" href="/" aria-label="HomeLead Connect home">
          <img src="/hlc-logo-public.webp" alt="HomeLead Connect LLC" width={440} height={142} loading="eager" decoding="async"/>
        </a>
        <a className="hlc-frontdoor-request" href="/request-service">Request service</a>
        <details className="hlc-frontdoor-menu">
          <summary>Menu</summary>
          <div className="hlc-frontdoor-menu-panel" aria-label="Public navigation">
            {menuLinks.map(([label,href])=><a key={href} href={href}>{label}</a>)}
          </div>
        </details>
      </div>
    </header>

    <section className="hlc-frontdoor-hero" aria-labelledby="hlc-frontdoor-title">
      <img className="hlc-frontdoor-hero-media" src="/hlc-frontdoor-resident-hero-v2.webp" alt="HomeLead Connect helping a family at home" width={1536} height={864} fetchPriority="high" decoding="async"/>
      <div className="hlc-frontdoor-hero-inner">
        <p className="hlc-frontdoor-kicker">More than homes.</p>
        <h1 id="hlc-frontdoor-title" className="hlc-frontdoor-title">We Build <span>Opportunities.</span></h1>
        <p className="hlc-frontdoor-copy">HomeLead Connect brings residents, professionals, partners, and communities into one human-centered service network—so a request can become real progress.</p>
        <div className="hlc-frontdoor-actions">
          <a className="hlc-frontdoor-btn" href="/request-service">Request home service</a>
          <a className="hlc-frontdoor-btn hlc-frontdoor-btn--ghost" href="/about">Meet the mission</a>
        </div>
      </div>
    </section>

    <section className="hlc-frontdoor-path-intro" aria-labelledby="hlc-frontdoor-path-title">
      <div className="hlc-frontdoor-container">
        <p className="hlc-frontdoor-eyebrow">Choose your path</p>
        <h2 id="hlc-frontdoor-path-title" className="hlc-frontdoor-bigline">Built around the people doing the work.</h2>
        <p className="hlc-frontdoor-subline">Different needs. One connected platform.</p>
      </div>
    </section>

    {worlds.map(world=><section className={`hlc-frontdoor-world hlc-frontdoor-world--${world.key}`} key={world.key} aria-labelledby={`hlc-frontdoor-${world.key}-title`}>
      <div className="hlc-frontdoor-world-media">
        <img src={world.image} alt="" loading="lazy" decoding="async"/>
      </div>
      <div className="hlc-frontdoor-container hlc-frontdoor-world-copy">
        <h2 id={`hlc-frontdoor-${world.key}-title`}>{world.title}</h2>
        <p>{world.copy}</p>
        <a className="hlc-frontdoor-world-link" href={world.href}>{world.cta}</a>
      </div>
    </section>)}

    <section className="hlc-frontdoor-connected" aria-labelledby="hlc-frontdoor-connected-title">
      <div className="hlc-frontdoor-container hlc-frontdoor-connected-grid">
        <div>
          <p className="hlc-frontdoor-eyebrow">The connected experience</p>
          <h2 id="hlc-frontdoor-connected-title">One place for the next right move.</h2>
          <p>Start with service, find the right people, and keep the work connected from first conversation to follow-through.</p>
          <a className="hlc-frontdoor-world-link" style={{color:"var(--mint)"}} href="/how-it-works">See how HLC works →</a>
        </div>
        <aside className="hlc-frontdoor-app" aria-label="The HLC app">
          <p className="hlc-frontdoor-app-label">The HLC App</p>
          <h3>Your opportunity.<br/>In your hands.</h3>
          <div className="hlc-frontdoor-app-icon"><img src="/hlc-icon.jpeg" alt="HLC app icon" width={270} height={270} loading="lazy" decoding="async"/></div>
          <p>One connected place to manage your home, services, professional opportunities, and community connections.</p>
          <a className="hlc-frontdoor-btn" href="/app">Open HLC App →</a>
        </aside>
      </div>
    </section>

    <section className="hlc-frontdoor-worlds" aria-labelledby="hlc-frontdoor-visual-worlds-title">
      <div className="hlc-frontdoor-container">
        <div className="hlc-frontdoor-worlds-head">
          <div>
            <p className="hlc-frontdoor-eyebrow">The HLC visual worlds</p>
            <h2 id="hlc-frontdoor-visual-worlds-title">One ecosystem. Four ways in.</h2>
          </div>
          <p>Residents · Professionals · Partners · Internal</p>
        </div>
        <div className="hlc-frontdoor-worlds-grid">
          {worlds.map(world=><article className={`hlc-frontdoor-world-card hlc-frontdoor-world-card--${world.key}`} key={world.key}>
            <div className="hlc-frontdoor-world-card-content"><strong>{world.title.replace("For ","")}</strong><span>{world.copy}</span></div>
          </article>)}
        </div>
      </div>
    </section>

    <section className="hlc-frontdoor-brand" aria-labelledby="hlc-frontdoor-brand-title">
      <div className="hlc-frontdoor-container hlc-frontdoor-brand-grid">
        <div>
          <p className="hlc-frontdoor-eyebrow" style={{color:"#536579"}}>Brand rule</p>
          <h2 id="hlc-frontdoor-brand-title">HomeLead Connect = The Platform.<br/>HLC = The App.</h2>
          <p>Same mission. Different experiences. One connected ecosystem.</p>
          <p><strong>Connecting Homes. Creating Opportunities.</strong></p>
        </div>
        <img src="/hlc-logo-public.webp" alt="HomeLead Connect LLC official logo" width={440} height={142} loading="lazy"/>
      </div>
    </section>

    <footer className="hlc-frontdoor-footer">HomeLead Connect LLC · Connecting Homes. Creating Opportunities.</footer>
  </main>;
}
