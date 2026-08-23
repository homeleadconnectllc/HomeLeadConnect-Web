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
          HomeLead Connect carries Kendrell’s name forward as a personal dedication from his brother, Antoine Washington — with purpose, care, family pride, and respect for the life and memories behind the name.
        </p>
        <p>
          Kendrell was a Harrisburg High School graduate, a HACC student, and an aspiring music artist. This memorial preserves those family-approved details simply and respectfully.
        </p>
      </section>

      <section className="hlc-public-story-card hlc-memorial-note">
        <p className="hlc-public-story-eyebrow">A BROTHER’S DEDICATION</p>
        <h2>A name carried forward with purpose</h2>
        <p>
          The dedication is part of HomeLead Connect’s story, but it remains separate from product operations. This page exists to honor Kendrell as a person and family member first.
        </p>
      </section>

      <nav className="hlc-public-story-actions" aria-label="Memorial page navigation">
        <Link to="/about">Founder story</Link>
        <Link className="is-secondary" to="/">HomeLead Connect home</Link>
      </nav>
    </main>
  );
}
