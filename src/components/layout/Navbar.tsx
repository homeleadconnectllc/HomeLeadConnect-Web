export default function Navbar() {
  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        padding: "20px 40px",
        background: "#111827",
        color: "white",
      }}
    >
      <h2>🏠 HomeLead Connect</h2>

      <div style={{ display: "flex", gap: 20 }}>
        <a href="/">Home</a>
        <a href="/about">About</a>
        <a href="/contact">Contact</a>
      </div>
    </nav>
  );
}