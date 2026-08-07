import Footer from "../components/Footer";

const features = [
  "CRM",
  "Websites",
  "Mobile App",
  "AI Automation",
  "Contractor Network",
  "Lead Management",
];

export default function HomePage() {
  return (
    <>
      <main
        style={{
          minHeight: "100vh",
          background: "#ffffff",
          color: "#111827",
          padding: "80px 24px",
        }}
      >
        <section
          style={{
            maxWidth: "1100px",
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <img
            src="/hlc-trans-logo.jpeg"
            alt="HomeLead Connect"
            style={{
              width: 280,
              maxWidth: "90%",
              background: "#fff",
              objectFit: "contain",
              marginBottom: 40,
            }}
          />

          <h1
            style={{
              fontSize: "clamp(42px, 6vw, 72px)",
              lineHeight: 1.05,
              letterSpacing: "-2px",
              marginBottom: 24,
              fontWeight: 800,
            }}
          >
            One Platform.
            <br />
            Every Home Service.
          </h1>

          <p
            style={{
              maxWidth: 720,
              margin: "0 auto 40px",
              fontSize: 22,
              lineHeight: 1.6,
              color: "#4b5563",
            }}
          >
            HomeLead Connect brings homeowners, contractors, leads,
            websites, CRM, AI tools, and business automation together
            in one powerful ecosystem.
          </p>

          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 16,
              flexWrap: "wrap",
            }}
          >
            <button
              style={{
                background: "#111827",
                color: "white",
                padding: "16px 34px",
                borderRadius: 12,
                border: "none",
                fontSize: 18,
                fontWeight: 700,
              }}
            >
              Get Started
            </button>

            <button
              style={{
                background: "white",
                color: "#111827",
                padding: "16px 34px",
                borderRadius: 12,
                border: "1px solid #d1d5db",
                fontSize: 18,
                fontWeight: 700,
              }}
            >
              Explore Platform
            </button>
          </div>
        </section>


        <section
          style={{
            maxWidth: 1100,
            margin: "90px auto 0",
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit,minmax(220px,1fr))",
            gap: 24,
          }}
        >
          {features.map((feature) => (
            <div
              key={feature}
              style={{
                background: "#ffffff",
                border: "1px solid #e5e7eb",
                borderRadius: 20,
                padding: 32,
                boxShadow:
                  "0 20px 40px rgba(0,0,0,.06)",
              }}
            >
              <h3
                style={{
                  margin: 0,
                  fontSize: 22,
                }}
              >
                {feature}
              </h3>
              <p
                style={{
                  marginTop: 12,
                  color: "#6b7280",
                }}
              >
                Built into the HomeLead Connect ecosystem.
              </p>
            </div>
          ))}
        </section>
      </main>

      <Footer />
    </>
  );
}
