import { useEffect } from "react";
import { Link } from "react-router-dom";

const legacyItems = [
  { label: "Education", value: "Harrisburg High School graduate" },
  { label: "Next chapter", value: "HACC student" },
  { label: "Creative dream", value: "Aspiring music artist" },
];

export function KendrellMemorial({ standalone = false }: { standalone?: boolean }) {
  return <section className={`hlc-kendrell-memorial${standalone ? " is-standalone" : ""}`} aria-labelledby="kendrell-memorial-title">
    {standalone && <div className="hlc-kendrell-portrait-stage">
      <img src="/brand/avatars/Kendrell_Locked_HLC.png" alt="Symbolic Kendrell AI command-office visual" />
      <p>Symbolic Kendrell AI visual — not a historical photograph</p>
    </div>}
    <div className="hlc-kendrell-memorial-copy">
      <p className="hlc-kendrell-memorial-eyebrow">In loving memory</p>
      <h1 id="kendrell-memorial-title">Kendrell Charles Washington</h1>
      <p className="hlc-kendrell-memorial-dates">December 6, 1991 — November 17, 2010</p>
      <p className="hlc-kendrell-memorial-dedication">This command office was created by his brother, Antoine Washington, to carry Kendrell’s name forward with purpose, care, and family pride.</p>
      <div className="hlc-kendrell-legacy" aria-label="Kendrell's legacy">
        {legacyItems.map((item) => <span key={item.value}><small>{item.label}</small>{item.value}</span>)}
      </div>
      <nav className="hlc-kendrell-memorial-links" aria-label="Kendrell memorial navigation">
        {standalone
          ? <><Link to="/hq">Open Kendrell Command</Link><Link className="is-secondary" to="/dashboard">Back to dashboard</Link></>
          : <Link to="/hq/dedication">Open dedication page</Link>}
      </nav>
    </div>
    <div className="hlc-kendrell-memorial-mark" aria-hidden="true"><span>KCW</span><i /><i /><i /><i /></div>
  </section>;
}

export default function KendrellDedication() {
  useEffect(() => {
    document.body.classList.add("hlc-dedication-view");
    return () => document.body.classList.remove("hlc-dedication-view");
  }, []);

  return <main className="hlc-kendrell-dedication-page">
    <KendrellMemorial standalone />

    <section className="hlc-kendrell-story" aria-labelledby="kendrell-story-title">
      <div>
        <p className="hlc-kendrell-section-label">A brother’s dedication</p>
        <h2 id="kendrell-story-title">A name carried forward with purpose</h2>
      </div>
      <blockquote>“This command office was created by his brother, Antoine Washington, to carry Kendrell’s name forward with purpose, care, and family pride.”</blockquote>
      <p>The Kendrell Command office is the executive center of HomeLead Connect. Its place in HLC is both functional and personal: a lasting dedication built into the work, not placed outside of it.</p>
    </section>

    <section className="hlc-kendrell-path" aria-labelledby="kendrell-path-title">
      <header>
        <p className="hlc-kendrell-section-label">His path</p>
        <h2 id="kendrell-path-title">The details preserved here</h2>
        <p>Only family-approved and verified details are presented as history.</p>
      </header>
      <div className="hlc-kendrell-path-grid">
        {legacyItems.map((item, index) => <article key={item.value}>
          <span aria-hidden="true">0{index + 1}</span>
          <small>{item.label}</small>
          <h3>{item.value}</h3>
        </article>)}
      </div>
    </section>

    <section className="hlc-kendrell-gallery" aria-labelledby="kendrell-gallery-title">
      <div className="hlc-kendrell-gallery-emblem" aria-hidden="true">
        <img src="/hlc-logo-transparent.png" alt="" />
        <span>KCW</span>
      </div>
      <div>
        <p className="hlc-kendrell-section-label">Family photographs</p>
        <h2 id="kendrell-gallery-title">A place reserved for authentic memories</h2>
        <p>This gallery is ready for photographs selected by Antoine and the Washington family. HLC will not replace real family memories with generated images.</p>
        <p className="hlc-kendrell-gallery-note">Family-approved photos can be added here with captions, dates, and the stories behind them.</p>
      </div>
    </section>

    <footer className="hlc-kendrell-footer">
      <div className="hlc-kendrell-memorial-mark" aria-hidden="true"><span>KCW</span><i /><i /><i /><i /></div>
      <p>In loving memory of Kendrell Charles Washington</p>
      <nav aria-label="Dedication page footer navigation"><Link to="/hq">Continue to Kendrell Command</Link><Link to="/dashboard">Return to HLC</Link></nav>
    </footer>
  </main>;
}
