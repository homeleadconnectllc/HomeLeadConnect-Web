import type { ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { appUrl, publicUrl } from "../../config/siteOrigins";
import { pageImage } from "../../config/publicPageImagery";
import PublicSiteNav from "../PublicSiteNav";

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
  const { pathname } = useLocation();
  const visual = pageImage(pathname === "/register" ? "register" : pathname === "/forgot-password" ? "forgotPassword" : pathname === "/reset-password" ? "resetPassword" : "login");
  return (
    <main className="hlc-auth-shell hlc-auth-shell--flat">

      <PublicSiteNav />

      <div className="hlc-auth-main">
        <section className="hlc-auth-intro" aria-label="HomeLead Connect account overview">
          <figure className="hlc-auth-intro-visual"><img src={visual.src} alt={visual.alt} loading="eager" /></figure>
          <p className="hlc-auth-intro-kicker">Home services, connected better</p>
          <h2>Your next step, kept clear.</h2>
          <p>Sign in to keep your home-service requests, conversations, appointments, and next steps together in one trusted place.</p>
          <div className="hlc-auth-intro-proof" aria-label="HomeLead Connect account benefits">
            <span>Secure account access</span>
            <span>Clear service coordination</span>
            <span>One connected experience</span>
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
      </div>
      <nav aria-label="Account service and audience links" className="hlc-ui-auth-shell-b00b7d">
        <a href={publicUrl("/homeowners")}>Residents</a>
        <a href={publicUrl("/professionals")}>Professionals</a>
        <a href={publicUrl("/partners")}>Partners</a>
        <a href={publicUrl("/services")}>Platform</a>
        <a href={publicUrl("/about")}>About</a>
        <a href={publicUrl("/contact")}>Contact</a>
        <a href={appUrl("/request-service")}>Request Service</a>
      </nav>
    </main>
  );
}
