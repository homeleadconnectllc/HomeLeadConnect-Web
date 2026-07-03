const features = [
  "Website",
  "CRM",
  "SaaS",
  "Mobile App",
  "API",
  "Database",
  "AI",
  "Automations",
];

export default function HomePage() {
  return (
    <div>
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "20px 40px",
          background: "#0f172a",
          color: "white",
        }}
      >
        <h2>🏠 HomeLead Connect</h2>

        <div style={{ display: "flex", gap: 20 }}>
          <a href="#features" style={{ color: "white" }}>Features</a>
          <a href="#about" style={{ color: "white" }}>About</a>
          <a href="#contact" style={{ color: "white" }}>Contact</a>
        </div>
      </nav>

      <main
        style={{
          minHeight: "100vh",
          background: "#0f172a",
          color: "white",
          textAlign: "center",
          padding: "80px 20px",
        }}
      >
        <h1 style={{ fontSize: 56 }}>
          One Platform.
          <br />
          Every Home Service.
        </h1>

        <p style={{ maxWidth: 700, margin: "30px auto" }}>
          Connecting homeowners, contractors, subcontractors,
          and businesses through one modern platform.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: 20 }}>
          <button>Get Started</button>
          <button>Learn More</button>
        </div>

        <section
          id="features"
          style={{
            marginTop: 80,
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
            gap: 20,
          }}
        >
          {features.map((feature) => (
            <div
              key={feature}
              style={{
                background: "#1e293b",
                padding: 30,
                borderRadius: 12,
              }}
            >
              <h3>{feature}</h3>
            </div>
          ))}
        </section>

        <section id="about" style={{ marginTop: 100 }}>
          <h2>About HomeLead Connect</h2>
          <p>
            We're building a complete ecosystem for homeowners,
            service professionals, and businesses.
          </p>
        </section>

        <section id="contact" style={{ marginTop: 100 }}>
          <h2>Contact</h2>
          <p>Coming Soon</p>
        </section>
      </main>
    </div>
  );
}
