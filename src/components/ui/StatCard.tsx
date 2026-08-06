export default function StatCard({
  title,
  value,
  description
}: {
  title:string;
  value:string;
  description:string;
}) {
  return (
    <div style={{
      background:"#111827",
      border:"1px solid #263244",
      borderRadius:"18px",
      padding:"24px",
      minHeight:"130px"
    }}>
      <p style={{
        color:"#94a3b8",
        margin:0,
        fontSize:"14px"
      }}>
        {title}
      </p>

      <h2 style={{
        color:"#60a5fa",
        fontSize:"38px",
        margin:"12px 0"
      }}>
        {value}
      </h2>

      <p style={{
        color:"#cbd5e1",
        margin:0
      }}>
        {description}
      </p>
    </div>
  );
}
