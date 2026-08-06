import type { ReactNode } from "react";

export default function Card({children}: {children: ReactNode}) {
  return (
    <div style={{
      background:"#111827",
      border:"1px solid #1f2937",
      borderRadius:"16px",
      padding:"24px",
      boxShadow:"0 10px 30px rgba(0,0,0,.25)"
    }}>
      {children}
    </div>
  );
}
