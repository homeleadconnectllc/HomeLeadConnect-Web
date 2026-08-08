type Props = {
  value: string;
  onChange: (value: string) => void;
};

export default function LeadSearch({ value, onChange }: Props) {
  return (
    <input
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Search leads, names, or lead codes..."
      aria-label="Search leads"
      style={{
        flex: "1 1 280px",
        minWidth: 220,
        padding: "11px 13px",
        borderRadius: 10,
        border: "1px solid #334155",
        background: "#0f172a",
        color: "#fff",
        outline: "none",
      }}
    />
  );
}
