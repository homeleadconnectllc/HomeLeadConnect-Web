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

export default function FeaturesPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#0f172a",
        color: "white",
        padding: "80px 20px",
      }}
    >
      <h1 style={{ textAlign: "center", marginBottom: "40px" }}>
        Platform Features
      </h1>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
          gap: "20px",
          maxWidth: "1000px",
          margin: "0 auto",
        }}
      >
        {features.map((feature) => (
          <div
            key={feature}
            style={{
              background: "#1e293b",
              padding: "24px",
              borderRadius: "12px",
              textAlign: "center",
            }}
          >
            <h3>{feature}</h3>
          </div>
        ))}
      </div>
    </main>
  );
}