type Props = {
  onAdd: () => void;
};

export default function LeadEmptyState({ onAdd }: Props) {
  return (
    <div
      style={{
        textAlign: "center",
        padding: "60px 20px",
        background: "#0f172a",
        border: "1px solid #1e293b",
        borderRadius: 14,
      }}
    >
      <h3 style={{ marginBottom: 8 }}>No leads found</h3>
      <p style={{ color: "#94a3b8" }}>
        Try changing your search or filters, or create a new lead.
      </p>
      <button type="button" onClick={onAdd} style={primaryButton}>
        Add Lead
      </button>
    </div>
  );
}

const primaryButton = {
  marginTop: 14,
  padding: "10px 16px",
  borderRadius: 9,
  border: 0,
  background: "#2563eb",
  color: "#fff",
  fontWeight: 700,
  cursor: "pointer",
};
