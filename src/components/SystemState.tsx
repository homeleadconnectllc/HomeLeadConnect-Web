import type { ReactNode } from "react";
import "./SystemState.css";

type SystemStateProps = {
  title: string;
  message: string;
  detail?: string;
  action?: ReactNode;
  tone?: "neutral" | "warning" | "danger";
  busy?: boolean;
};

export default function SystemState({ title, message, detail, action, tone = "neutral", busy = false }: SystemStateProps) {
  return (
    <main className={`hlc-system-state is-${tone}`}>
      <section className="hlc-system-state-card" aria-live={busy ? "polite" : undefined}>
        <div className="hlc-system-state-mark" aria-hidden="true">{busy ? <span className="hlc-system-state-spinner" /> : <span>•</span>}</div>
        <div className="hlc-system-state-copy">
          <p className="hlc-system-state-eyebrow">{busy ? "Please wait" : tone === "danger" ? "Action unavailable" : tone === "warning" ? "Attention" : "Account status"}</p>
          <h1>{title}</h1>
          <p>{message}</p>
          {detail && <small>{detail}</small>}
          {action && <div className="hlc-system-state-action">{action}</div>}
        </div>
      </section>
    </main>
  );
}
