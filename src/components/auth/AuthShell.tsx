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
      <nav className="hlc-auth-public-nav" aria-label="Public site navigation">
        <div className="hlc-auth-public-nav-inner">
          <a className="hlc-auth-public-brand" href="https://homeleadconnect.org/" aria-label="HomeLead Connect home">
            <img src="/hlc-logo-ui.png" alt="HomeLead Connect" width="48" height="48" />
          </a>
          <div className="hlc-auth-public-links">
            <a href="https://residents.homeleadconnect.org/">Residents</a>
            <a href="https://professionals.homeleadconnect.org/">Professionals</a>
            <a href="https://partners.homeleadconnect.org/">Partners</a>
            <a href="https://platform.homeleadconnect.org/">Platform</a>
            <a href="https://about.homeleadconnect.org/">About</a>
            <a href="https://contact.homeleadconnect.org/">Contact</a>
            <a className="hlc-auth-public-request" href="https://app.homeleadconnect.org/request-service">Request Service</a>
          </div>
        </div>
      </nav>

      <section className="hlc-auth-brand" aria-label="HomeLead Connect">
        <a className="hlc-auth-logo-link" href="https://homeleadconnect.org" aria-label="Return to HomeLead Connect home">
          <img src="/hlc-logo-ui.png" alt="HomeLead Connect" />
        </a>
        <div className="hlc-auth-brand-story">
          <p className="hlc-auth-brand-kicker">Home services, connected better</p>
          <h2>One trusted place for the work around home.</h2>
          <p>Requests, conversations, appointments, and next steps—kept clear from the first connection forward.</p>
        </div>
        <div className="hlc-auth-brand-proof" aria-label="HomeLead Connect account benefits">
          <span>Secure account access</span>
          <span>Clear service coordination</span>
        </div>
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
