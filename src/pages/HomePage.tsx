import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

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
    <>
      <Navbar />

      <main
        style={{
          minHeight: "100vh",
          background: "#0f172a",
          color: "white",
          textAlign: "center",
          padding: "100px 20px",
        }}
      >
        <h1
          style={{
            fontSize: "64px",
            lineHeight: "1.2",
            marginBottom: "24px",
          }}
        >
          HomeLead Connect
          <br />
          One Platform. Every Home Service.
        </h1>

        <p
          style={{
            maxWidth: "700px",
            margin: "0 auto 40px",
            lineHeight: "1.6",
            fontSize: "20px",
          }}
        >
          Connecting homeowners, contractors, subcontractors, and businesses
          through one modern platform.
        </p>

        <div
          style={{
            display: "flex",
            gap: "20px",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          <button>Get Started</button>
          <button>Learn More</button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "20px",
            maxWidth: "1000px",
            margin: "80px auto",
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
        </div>
      </main>

      <Footer />
    </>
  );
}