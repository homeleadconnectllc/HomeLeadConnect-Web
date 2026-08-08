type Props = {
  value: string | null;
};

function humanize(value: string | null) {
  if (!value) return "—";
  return value
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export default function LeadStatusBadge({ value }: Props) {
  return (
    <span
      style={{
        display: "inline-flex",
        padding: "4px 9px",
        borderRadius: 999,
        background: "#1e293b",
        color: "#cbd5e1",
        fontSize: 12,
        fontWeight: 600,
        whiteSpace: "nowrap",
      }}
    >
      {humanize(value)}
    </span>
  );
}
