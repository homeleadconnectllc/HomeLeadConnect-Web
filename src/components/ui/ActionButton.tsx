export default function ActionButton({
  children
}: {
  children:string
}) {
  return (
    <button style={{
      background:"#2563eb",
      color:"#fff",
      border:"none",
      borderRadius:"10px",
      padding:"12px 18px",
      cursor:"pointer",
      fontWeight:600
    }}>
      {children}
    </button>
  );
}
