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
        color: "#fff",
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
            width: 50,
            height: 50,
            objectFit: "contain",
          }}
        />

        <h2 style={{ margin: 0 }}>HomeLead Connect</h2>
      </div>

      <div
        style={{
          display: "flex",
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