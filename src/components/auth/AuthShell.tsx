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
  brandImageSrc,
  brandImageAlt = "HomeLead Connect",
}: AuthShellProps) {
  const usesBrandArtwork = Boolean(brandImageSrc);
  const resolvedBrandImageSrc = usesBrandArtwork ? "/hlc-logo-final.png" : "/hlc-logo-transparent.png";
  const brandStyle = usesBrandArtwork
    ? {
        alignItems: "center",
        justifyContent: "center",
        backgroundImage:
          "linear-gradient(180deg, rgba(5,11,19,.08) 0%, rgba(5,11,19,.28) 45%, rgba(5,11,19,.88) 100%), linear-gradient(90deg, rgba(8,21,39,.42), rgba(8,21,39,.08), rgba(8,21,39,.42)), url('/hlc-login-harrisburg-bg.webp')",
        backgroundPosition: "center",
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
      }
    : undefined;

  return (
    <main className={`hlc-auth-shell hlc-auth-shell--flat${usesBrandArtwork ? " hlc-auth-shell--login-artwork" : ""}`}>
      {usesBrandArtwork && (
        <style>{`
          html body #root .hlc-auth-shell--login-artwork .hlc-auth-brand {
            align-items: center !important;
            justify-content: center !important;
          }

          html body #root .hlc-auth-shell--login-artwork .hlc-auth-logo-link--artwork {
            position: relative !important;
            z-index: 2 !important;
            display: flex !important;
            width: min(380px, 88%) !important;
            margin: 0 auto !important;
            filter: none !important;
          }

          html body #root .hlc-auth-shell--login-artwork .hlc-auth-logo-link--artwork img {
            display: block !important;
            width: 100% !important;
            height: auto !important;
            max-width: 380px !important;
            padding: 0 !important;
            border: 0 !important;
            border-radius: 18px !important;
            background: rgba(255,255,255,.97) !important;
            object-fit: contain !important;
            filter: none !important;
            box-shadow: 0 24px 70px rgba(0,0,0,.34) !important;
          }

          html body #root .hlc-auth-shell--login-artwork .hlc-auth-brand-story,
          html body #root .hlc-auth-shell--login-artwork .hlc-auth-brand-proof {
            display: none !important;
          }

          @media (max-width: 860px) {
            html body #root .hlc-auth-shell--login-artwork .hlc-auth-brand {
              min-height: 390px !important;
              padding: 34px 20px 42px !important;
              border-bottom: 1px solid rgba(191,211,239,.14) !important;
              background-position: center 42% !important;
            }

            html body #root .hlc-auth-shell--login-artwork .hlc-auth-logo-link--artwork {
              width: min(310px, 82vw) !important;
            }
          }

          @media (max-width: 480px) {
            html body #root .hlc-auth-shell--login-artwork .hlc-auth-brand {
              min-height: 330px !important;
              padding: 28px 18px 34px !important;
            }

            html body #root .hlc-auth-shell--login-artwork .hlc-auth-logo-link--artwork {
              width: min(260px, 78vw) !important;
            }
          }
        `}</style>
      )}

      <section
        className={`hlc-auth-brand${usesBrandArtwork ? " hlc-auth-brand--artwork" : ""}`}
        aria-label="HomeLead Connect"
        style={brandStyle}
      >
        <a
          className={`hlc-auth-logo-link${usesBrandArtwork ? " hlc-auth-logo-link--artwork" : ""}`}
          href="https://homeleadconnect.org"
          aria-label="Return to HomeLead Connect home"
        >
          <img src={resolvedBrandImageSrc} alt={brandImageAlt} />
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
