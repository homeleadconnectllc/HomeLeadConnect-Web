import "./App.css";

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

function App() {
  return (
    <div className="app">
      <nav
        style={{
          display: "flex",
          justifyContent: "space-between",
          padding: "20px 40px",
          background: "#0f172a",
          color: "white",
          position: "sticky",
          top: 0,
        }}
      >
        <h2>🏠 HomeLead Connect</h2>

        <div style={{ display: "flex", gap: "20px" }}>
          <a href="#features" style={{ color: "white" }}>Features</a>
          <a href="#about" style={{ color: "white" }}>About</a>
          <a href="#contact" style={{ color: "white" }}>Contact</a>
        </div>
      </nav>

      <main
        style={{
          textAlign: "center",
          padding: "80px 20px",
          background: "#0f172a",
          color: "white",
          minHeight: "100vh",
        }}
      >
        <h1 style={{ fontSize: "56px" }}>
          One Platform.
          <br />
          Every Home Service.
        </h1>

        <p style={{ maxWidth: "700px", margin: "30px auto" }}>
          Connecting homeowners, contractors, subcontractors,
          and businesses through one modern platform.
        </p>

        <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
          <button>Get Started</button>
          <button>Learn More</button>
        </div>

        <section
          id="features"
          style={{
            marginTop: "80px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
            gap: "20px",
          }}
        >
          {features.map((feature) => (
            <div
              key={feature}
              style={{
                background: "#1e293b",
                padding: "30px",
                borderRadius: "12px",
              }}
            >
              <h3>{feature}</h3>
            </div>
          ))}
        </section>

        <section id="about" style={{ marginTop: "100px" }}>
          <h2>About HomeLead Connect</h2>
          <p>
            We're building a complete ecosystem for homeowners,
            service professionals, and businesses.
          </p>
        </section>

        <section id="contact" style={{ marginTop: "100px" }}>
          <h2>Contact</h2>
          <p>Coming Soon</p>
        </section>
      </main>
    </div>
  );
}

export default App;