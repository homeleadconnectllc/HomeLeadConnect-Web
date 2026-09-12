import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import "../styles/v2-cinematic-community-homepage-20260911.css";

const pathways = [
  { key: "resident", icon: "⌂", title: "For Residents", copy: "Build wealth. Find trusted professionals. Create your future at home.", href: "/homeowners" },
  { key: "professional", icon: "⌁", title: "For Professionals", copy: "Grow your business. Get more opportunities. Make a bigger impact.", href: "/professionals" },
  { key: "partner", icon: "◎", title: "For Partners", copy: "Collaborate. Invest. Build stronger communities. Create lasting change.", href: "/partners" },
  { key: "community", icon: "◌", title: "For Our Community", copy: "Stronger neighborhoods. Greater possibilities. A brighter tomorrow.", href: "/community" },
];

export default function HomePage() {
  return (
    <>
      <main className="hlc-v2-home">
        <header className="hlc-v2-nav">
          <div className="hlc-v2-nav-inner">
            <a className="hlc-v2-brand" href="/" aria-label="HomeLead Connect home">
              <img src="/hlc-logo-transparent.png" alt="HomeLead Connect LLC" width={440} height={150} loading="eager" decoding="async" />
            </a>
            <nav className="hlc-v2-nav-links" aria-label="Primary navigation">
              <a href="/">Home</a>
              <a href="/about">About</a>
              <a href="/homeowners">For Residents</a>
              <a href="/professionals">For Professionals</a>
              <a href="/partners">For Partners</a>
              <a href="/community">For Community</a>
              <div className="hlc-v2-nav-actions">
                <a className="hlc-v2-btn hlc-v2-btn--ghost" href="/login">Login</a>
                <a className="hlc-v2-btn hlc-v2-btn--primary" href="/register">Get Started <span aria-hidden="true">→</span></a>
              </div>
            </nav>
          </div>
        </header>

        <section className="hlc-v2-hero" aria-labelledby="hlc-v2-hero-title">
          <div className="hlc-v2-hero-inner">
            <p className="hlc-v2-eyebrow">More than homes.</p>
            <h1 id="hlc-v2-hero-title">Real People.<br /><span>Real Opportunity.</span></h1>
            <p className="hlc-v2-hero-copy">HomeLead Connect brings together residents, professionals, partners and communities to create opportunity, access and a stronger connected future.</p>
            <div className="hlc-v2-hero-actions">
              <a className="hlc-v2-btn hlc-v2-btn--primary" href="/register">Get Started <span aria-hidden="true">→</span></a>
              <a className="hlc-v2-btn hlc-v2-btn--ghost" href="/about">Learn More</a>
              <Link className="hlc-v2-btn hlc-v2-btn--ghost" to="/request-service">Get Help Now</Link>
            </div>
          </div>
          <div className="hlc-v2-horizon" aria-hidden="true" />
        </section>

        <section className="hlc-v2-section hlc-v2-section--dark" aria-labelledby="hlc-v2-ecosystem-title">
          <div className="hlc-v2-wrap">
            <div className="hlc-v2-section-head">
              <p className="hlc-v2-eyebrow">The HLC ecosystem</p>
              <h2 id="hlc-v2-ecosystem-title">One Platform.<br />Four Pathways.</h2>
              <p className="hlc-v2-section-copy">Different needs. Same mission. A stronger, more connected community.</p>
            </div>
            <div className="hlc-v2-pathways">
              <div className="hlc-v2-intro-tile">
                <p>HomeLead Connect connects the people, services, businesses and relationships that make a community work.</p>
                <a className="hlc-v2-link" href="/how-it-works">Explore the ecosystem →</a>
              </div>
              {pathways.map((pathway) => (
                <article className={`hlc-v2-card hlc-v2-card--${pathway.key}`} key={pathway.key}>
                  <div className="hlc-v2-card-content">
                    <span className="hlc-v2-card-icon" aria-hidden="true">{pathway.icon}</span>
                    <h3>{pathway.title}</h3>
                    <p>{pathway.copy}</p>
                    <a href={pathway.href}>Learn More →</a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="hlc-v2-section hlc-v2-section--light" aria-labelledby="hlc-v2-vision-title">
          <div className="hlc-v2-wrap hlc-v2-vision">
            <div className="hlc-v2-vision-copy">
              <p className="hlc-v2-eyebrow">The HLC vision</p>
              <h2 id="hlc-v2-vision-title">A Stronger Community Builds a Brighter Future.</h2>
              <p>HomeLead Connect is more than a platform — it is a connected ecosystem where people, resources and opportunities come together to create lasting impact.</p>
              <a className="hlc-v2-link" href="/about">Explore the vision →</a>
              <div className="hlc-v2-storyline" aria-label="HomeLead Connect story">
                <span>City</span><span>Neighborhood</span><span>Home</span><span>People</span><span>Opportunity</span>
              </div>
            </div>
            <div className="hlc-v2-vision-media" aria-label="City and community visual" />
          </div>
        </section>

        <section className="hlc-v2-section hlc-v2-section--dark" aria-labelledby="hlc-v2-app-title">
          <div className="hlc-v2-wrap hlc-v2-app">
            <div className="hlc-v2-app-copy">
              <p className="hlc-v2-eyebrow">Powered by people + technology</p>
              <h2 id="hlc-v2-app-title">The HLC app puts the power of HomeLead Connect in your hands.</h2>
              <p className="hlc-v2-section-copy">The public brand introduces the ecosystem. HLC is the compact operating identity that helps you run your HomeLead world.</p>
              <ul className="hlc-v2-app-points">
                <li>Manage your home and service needs</li>
                <li>Find trusted professionals and opportunities</li>
                <li>Connect with partners and your community</li>
                <li>Move from discovery to action in one place</li>
              </ul>
              <div className="hlc-v2-hero-actions">
                <Link className="hlc-v2-btn hlc-v2-btn--primary" to="/app">Open HomeLead Connect →</Link>
              </div>
            </div>
            <div className="hlc-v2-app-icon">
              <img src="/hlc-icon.jpeg" alt="HLC app icon" width={270} height={270} loading="lazy" decoding="async" />
            </div>
          </div>
        </section>

        <section className="hlc-v2-horizon-band" aria-label="HomeLead Connect brand statement">
          <div className="hlc-v2-horizon-band-inner">
            <div>
              <h2>Connecting Homes.<br />Creating <span style={{color:"#168dff"}}>Opportunities.</span></h2>
              <p>One platform. Four pathways. Infinite impact.</p>
            </div>
            <a className="hlc-v2-btn hlc-v2-btn--primary" href="/register">Join HomeLead Connect →</a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
