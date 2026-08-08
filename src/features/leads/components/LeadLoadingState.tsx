export default function LeadLoadingState() {
  return (
    <div
      aria-label="Loading leads"
      style={{
        background: "#0f172a",
        border: "1px solid #1e293b",
        borderRadius: 14,
        padding: 18,
      }}
    >
      {Array.from({ length: 7 }).map((_, index) => (
        <div
          key={index}
          style={{
            height: 44,
            marginBottom: 10,
            borderRadius: 8,
            background: "#1e293b",
            opacity: 0.7,
          }}
        />
      ))}
    </div>
  );
}
