const logo = "/hlc-logo-final.png";

export default function Navbar() {
  return (
    <nav
      style={{
        display: "flex",
        flexWrap: "wrap",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px 40px",
        gap: "16px",
        background: "#111827",
        color: "#fff",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flexShrink: 0,
        }}
      >
        <img
          src={logo}
          alt="HomeLead Connect LLC"
          style={{
            width: 50,
            height: 50,
            objectFit: "contain",
            flexShrink: 0,
          }}
        />

        <h2 style={{ margin: 0, whiteSpace: "nowrap" }}>HomeLead Connect</h2>
      </div>

      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          alignItems: "center",
        }}
      >
        <a href="/">Home</a>
        <a href="/contact">Contact</a>

        <button>CRM Login</button>
      </div>
    </nav>
  );
}
