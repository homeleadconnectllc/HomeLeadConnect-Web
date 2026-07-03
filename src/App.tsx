export default function App() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "#111827",
        color: "#ffffff",
        textAlign: "center",
        padding: "2rem",
      }}
    >
      <img
        src="/logo.png"
        alt="HomeLead Connect"
        style={{
          width: "220px",
          marginBottom: "2rem",
        }}
      />

      <h1 style={{ fontSize: "3rem", marginBottom: "1rem" }}>
        HomeLead Connect
      </h1>

      <h2 style={{ color: "#60a5fa", marginBottom: "1rem" }}>
        One Platform. Every Home Service.
      </h2>

      <p style={{ maxWidth: "700px", fontSize: "1.2rem", color: "#d1d5db" }}>
        Connecting homeowners, contractors, subcontractors, and businesses
        through one modern platform.
      </p>
    </div>
  );
}