export default function Footer() {
  return (
    <footer
      style={{
        background: "#111827",
        color: "#9ca3af",
        textAlign: "center",
        padding: "30px",
      }}
    >
      © {new Date().getFullYear()} HomeLead Connect LLC
    </footer>
  );
}