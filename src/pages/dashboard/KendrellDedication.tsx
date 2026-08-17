import { Link } from "react-router-dom";

export function KendrellMemorial({ standalone = false }: { standalone?: boolean }) {
  return <section className={`hlc-kendrell-memorial${standalone ? " is-standalone" : ""}`} aria-labelledby="kendrell-memorial-title">
    <div className="hlc-kendrell-memorial-copy">
      <p className="hlc-kendrell-memorial-eyebrow">In loving memory</p>
      <h1 id="kendrell-memorial-title">Kendrell Charles Washington</h1>
      <p className="hlc-kendrell-memorial-dates">December 6, 1991 — November 17, 2010</p>
      <p className="hlc-kendrell-memorial-dedication">This command office was created by his brother, Antoine Washington, to carry Kendrell’s name forward with purpose, care, and family pride.</p>
      <div className="hlc-kendrell-legacy" aria-label="Kendrell's legacy">
        <span>Harrisburg High School graduate</span>
        <span>HACC student</span>
        <span>Aspiring music artist</span>
      </div>
      <nav className="hlc-kendrell-memorial-links" aria-label="Kendrell memorial navigation">
        {standalone
          ? <Link to="/hq">Open Kendrell Command</Link>
          : <Link to="/hq/dedication">Open dedication page</Link>}
      </nav>
    </div>
    <div className="hlc-kendrell-memorial-mark" aria-hidden="true"><span>KCW</span><i /><i /><i /><i /></div>
  </section>;
}

export default function KendrellDedication() {
  return <main className="hlc-kendrell-dedication-page">
    <KendrellMemorial standalone />
  </main>;
}
