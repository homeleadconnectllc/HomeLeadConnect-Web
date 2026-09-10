import type { ReactNode } from "react";

type AuthShellProps = {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  status?: ReactNode;
  eyebrow?: string;
};

export default function AuthShell({
  title,
  description,
  children,
  footer,
  status,
  eyebrow = "Account access",
}: AuthShellProps) {
  return (
    <main className="hlc-auth-shell hlc-auth-shell--flat">
      <section className="hlc-auth-brand" aria-label="HomeLead Connect">
        <a className="hlc-auth-logo-link" href="https://homeleadconnect.org" aria-label="Return to HomeLead Connect home">
          <img src="/hlc-logo-transparent.png" alt="HomeLead Connect" />
        </a>
      </section>

      <section className="hlc-auth-card" aria-labelledby="hlc-auth-title">
        <div className="hlc-auth-form-heading">
          {eyebrow && <p className="hlc-auth-card-brand">{eyebrow}</p>}
          <h1 id="hlc-auth-title">{title}</h1>
          <p className="hlc-auth-card-description">{description}</p>
        </div>
        {status}
        {children}
        {footer && <footer className="hlc-auth-card-footer">{footer}</footer>}
      </section>
    </main>
  );
}
