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
  eyebrow = "HomeLead Connect account",
}: AuthShellProps) {
  return (
    <main className="hlc-auth-shell hlc-auth-shell--flat">
      <section className="hlc-auth-brand" aria-label="HomeLead Connect">
        <a className="hlc-auth-logo-link" href="https://homeleadconnect.org" aria-label="Return to HomeLead Connect home">
          <img src="/hlc-icon.jpeg" alt="" />
          <span>HomeLead Connect</span>
        </a>
        <div className="hlc-auth-brand-copy">
          <p className="hlc-auth-eyebrow">{eyebrow}</p>
          <h1>{title}</h1>
          <p className="hlc-auth-description">{description}</p>
        </div>
        <ol className="hlc-auth-steps" aria-label="Account access process">
          <li><strong>One account</strong><span>Use the same HLC identity across approved workspaces and portals.</span></li>
          <li><strong>One secure entry</strong><span>Login, recovery, registration and invitations stay in this account center.</span></li>
          <li><strong>One destination</strong><span>After access is verified, HLC routes you to the workspace or portal you belong to.</span></li>
        </ol>
      </section>

      <section className="hlc-auth-card" aria-labelledby="hlc-auth-title">
        <div className="hlc-auth-form-heading">
          <p className="hlc-auth-card-brand">Secure account access</p>
          <h2 id="hlc-auth-title">{title}</h2>
          <p className="hlc-auth-card-description">{description}</p>
        </div>
        {status}
        {children}
        {footer && <footer className="hlc-auth-card-footer">{footer}</footer>}
      </section>
    </main>
  );
}
