export default function Navbar() {
  return (
    <nav
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "18px 48px",
        background: "#ffffff",
        borderBottom: "1px solid #e5e4e7",
        color: "#111827",
        position: "sticky",
        top: 0,
        zIndex: 50,
      }}
    >
      <a
        href="/"
        style={{
          display: "flex",
          alignItems: "center",
          textDecoration: "none",
        }}
      >
        <img
          src="/hlc-logo-transparent.png"
          alt="HomeLead Connect"
          style={{
            height: 58,
            width: "auto",
            objectFit: "contain",
            background: "#fff",
          }}
        />
      </a>

      <div
        style={{
          display: "flex",
          gap: 28,
          alignItems: "center",
          fontWeight: 600,
        }}
      >
        <a href="/" style={{ color: "#111827", textDecoration: "none" }}>
          Home
        </a>

        <a href="/about" style={{ color: "#111827", textDecoration: "none" }}>
          About
        </a>

        <a href="/contact" style={{ color: "#111827", textDecoration: "none" }}>
          Contact
        </a>

        <button
          style={{
            background: "#111827",
            color: "#fff",
            border: "none",
            borderRadius: 10,
            padding: "12px 22px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          CRM Login
        </button>
      </div>
    </nav>
  );
}
