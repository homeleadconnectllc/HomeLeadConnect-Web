import { Link } from "react-router-dom";

const logo = "/branding/hlc-logo-full.png";

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
        <div
          style={{
            background: "white",
            padding: "8px 14px",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
          }}
        >
          <img
            src={logo}
            alt="HomeLead Connect LLC"
            style={{
              height: "72px",
              width: "auto",
              objectFit: "contain",
            }}
          />
        </div>

        <h2 style={{ margin: 0 }}>HomeLead Connect</h2>
      </div>

      <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
        <Link to="/" style={{ color: "white", textDecoration: "none" }}>
          Home
        </Link>

        <Link to="/contact" style={{ color: "white", textDecoration: "none" }}>
          Contact
        </Link>

        <Link to="/login">
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
        </Link>
      </div>
    </nav>
  );
}
