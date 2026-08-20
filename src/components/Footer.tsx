const legalLinkStyle = {
  color: "#bfdbfe",
  fontWeight: 600,
} as const;

export default function Footer() {
  return (
    <footer
      style={{
        background: "#111827",
        color: "#9ca3af",
        textAlign: "center",
        padding: "26px 20px",
      }}
    >
      <nav
        aria-label="Legal and accessibility"
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "10px 18px",
          marginBottom: 12,
        }}
      >
        <a style={legalLinkStyle} href="/privacy">Privacy</a>
        <a style={legalLinkStyle} href="/terms">Terms</a>
        <a style={legalLinkStyle} href="/accessibility">Accessibility</a>
        <a style={legalLinkStyle} href="/platform-disclosure">Platform disclosure</a>
      </nav>
      <div>© {new Date().getFullYear()} HomeLead Connect LLC</div>
    </footer>
  );
}
