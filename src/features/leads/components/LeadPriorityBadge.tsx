type Props = {
  value: string | null;
};

const labels: Record<string, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export default function LeadPriorityBadge({ value }: Props) {
  const key = value?.toLowerCase() ?? "";
  const label = labels[key] ?? value ?? "—";

  const background =
    key === "high"
      ? "#7f1d1d"
      : key === "medium"
        ? "#78350f"
        : "#1e3a8a";

  return (
    <span
      style={{
        display: "inline-flex",
        padding: "4px 9px",
        borderRadius: 999,
        background,
        color: "#fff",
        fontSize: 12,
        fontWeight: 700,
        whiteSpace: "nowrap",
      }}
    >
      {label}
    </span>
  );
}
