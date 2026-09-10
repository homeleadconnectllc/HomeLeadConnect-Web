import type { ReactNode } from "react";

type AuthShellProps = {
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
  status?: ReactNode;
  eyebrow?: string;
  brandImageSrc?: string;
  brandImageAlt?: string;
};

export default function AuthShell({
  title,
  description,
  children,
  footer,
  status,
  eyebrow = "Account access",
  brandImageSrc = "/hlc-logo-transparent.png",
  brandImageAlt = "HomeLead Connect",
}: AuthShellProps) {
  const usesBrandArtwork = brandImageSrc !== "/hlc-logo-transparent.png";

  return (
    <main className="hlc-auth-shell hlc-auth-shell--flat">
      <section className="hlc-auth-brand" aria-label="HomeLead Connect">
        <a
          className={`hlc-auth-logo-link${usesBrandArtwork ? " hlc-auth-logo-link--artwork" : ""}`}
          href="https://homeleadconnect.org"
          aria-label="Return to HomeLead Connect home"
        >
          <img src={brandImageSrc} alt={brandImageAlt} />
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
