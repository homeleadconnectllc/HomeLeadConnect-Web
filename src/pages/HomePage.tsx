import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const features = [
  {
    title: "CRM",
    text: "Manage leads, customers, contractors, and service opportunities.",
  },
  {
    title: "AI",
    text: "Intelligent tools designed to improve business workflows.",
  },
  {
    title: "Automations",
    text: "Streamline follow-ups and daily operations.",
  },
  {
    title: "API",
    text: "Built for future integrations and platform expansion.",
  },
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
          padding: "70px 20px",
        }}
      >
        <section
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "50px",
            alignItems: "center",
          }}
        >
          <div>
            <h1
              style={{
                fontSize: "56px",
                lineHeight: "1.1",
                marginBottom: "24px",
              }}
            >
              HomeLead Connect
              <br />
              One Platform. Every Home Service.
            </h1>

            <p
              style={{
                fontSize: "20px",
                lineHeight: "1.6",
                color: "#cbd5e1",
              }}
            >
              Connecting homeowners, contractors, subcontractors, and
              businesses through one modern platform.
            </p>

            <div
              style={{
                display: "flex",
                gap: "16px",
                marginTop: "35px",
              }}
            >
              <Link to="/login">
                <button
                  style={{
                    padding: "14px 28px",
                    borderRadius: "8px",
                    border: "none",
                    cursor: "pointer",
                  }}
                >
                  CRM Login
                </button>
              </Link>

              <Link to="/contact">
                <button
                  style={{
                    padding: "14px 28px",
                    borderRadius: "8px",
                    cursor: "pointer",
                  }}
                >
                  Contact
                </button>
              </Link>
            </div>
          </div>

          <div
            style={{
              background: "#1e293b",
              borderRadius: "16px",
              padding: "40px",
              minHeight: "280px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src="/branding/hlc-mark.png"
              alt="HomeLead Connect"
              style={{
                width: "160px",
                height: "160px",
                objectFit: "contain",
              }}
            />
          </div>
        </section>

        <section
          style={{
            maxWidth: "1100px",
            margin: "90px auto 0",
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px,1fr))",
            gap: "20px",
          }}
        >
          {features.map((feature) => (
            <div
              key={feature.title}
              style={{
                background: "#1e293b",
                padding: "28px",
                borderRadius: "12px",
              }}
            >
              <h3>{feature.title}</h3>
              <p style={{ color: "#cbd5e1" }}>
                {feature.text}
              </p>
            </div>
          ))}
        </section>
      </main>

      <Footer />
    </>
  );
}
