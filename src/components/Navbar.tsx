const logo = "/logo.png";

export default function Navbar() {
  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px 40px",
        background: "#111827",
        color: "white",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
        }}
      >
        <img
          src={logo}
          alt="HomeLead Connect LLC"
          style={{
            height: "50px",
            width: "50px",
            objectFit: "contain",
          }}
        />

        <h2 style={{ margin: 0 }}>HomeLead Connect</h2>
      </div>

      <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
        <a href="/" style={{ color: "white", textDecoration: "none" }}>
          Home
        </a>

        <a href="/contact" style={{ color: "white", textDecoration: "none" }}>
          Contact
        </a>

        <button
          style={{
            padding: "10px 18px",
            borderRadius: "8px",
            border: "none",
            cursor: "pointer",
          }}
        >
          CRM Login
        </button>
      </div>
    </nav>
  );
}