import { Link } from "react-router-dom";

export default function MemorialPage() {
  return (
    <main className="hlc-public-story hlc-memorial-page">
      <section className="hlc-public-story-hero hlc-memorial-hero" aria-labelledby="memorial-title">
        <p className="hlc-public-story-eyebrow">IN REMEMBRANCE</p>
        <h1 id="memorial-title">Kendrell Memorial</h1>
        <p className="hlc-memorial-name">Kendrell Charles Washington</p>
        <p className="hlc-memorial-dates">December 6, 1991 — November 17, 2010</p>
      </section>

      <section className="hlc-public-story-card hlc-memorial-tribute" aria-label="Memorial tribute">
        <p>
          This page is a quiet place within the HomeLead Connect story to honor Kendrell’s memory and the family connection behind the name.
        </p>
        <p>
          Kendrell was a Harrisburg High School graduate, a HACC student, and an aspiring music artist.
        </p>
      </section>

      <section className="hlc-public-story-card hlc-memorial-note">
        <p className="hlc-public-story-eyebrow">A BROTHER’S DEDICATION</p>
        <h2>A name carried forward with purpose</h2>
        <p>
          Antoine Washington created the Kendrell command office to carry his brother’s name forward with purpose, care, and family pride.
        </p>
      </section>

      <nav className="hlc-public-story-actions" aria-label="Memorial page navigation">
        <Link to="/about">Founder story</Link>
        <Link className="is-secondary" to="/">HomeLead Connect home</Link>
      </nav>
    </main>
  );
}
