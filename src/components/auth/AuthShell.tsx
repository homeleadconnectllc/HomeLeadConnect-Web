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
  const resolvedBrandImageSrc =
    brandImageSrc ?? (window.location.pathname === "/login" ? "/hlc-login-brand.webp" : "/hlc-logo-transparent.png");
  const usesBrandArtwork = resolvedBrandImageSrc !== "/hlc-logo-transparent.png";

  return (
    <main className="hlc-auth-shell hlc-auth-shell--flat">
      {usesBrandArtwork && (
        <style>{`
          html body #root .hlc-auth-shell .hlc-auth-brand:has(.hlc-auth-logo-link--artwork) {
            align-items: center !important;
            justify-content: center !important;
            background:
              linear-gradient(180deg, rgba(5,11,19,.08) 0%, rgba(5,11,19,.28) 45%, rgba(5,11,19,.88) 100%),
              linear-gradient(90deg, rgba(8,21,39,.42), rgba(8,21,39,.08), rgba(8,21,39,.42)),
              url('/hlc-login-harrisburg-bg.webp') center / cover no-repeat !important;
          }

          html body #root .hlc-auth-shell .hlc-auth-logo-link--artwork {
            position: relative !important;
            z-index: 2 !important;
            width: min(360px, 86%) !important;
            margin: 0 auto !important;
            filter: none !important;
          }

          html body #root .hlc-auth-shell .hlc-auth-logo-link--artwork > span {
            width: 100% !important;
            max-width: 360px !important;
            aspect-ratio: 1 / 1 !important;
            border-radius: 22px !important;
            background-color: rgba(255,255,255,.98) !important;
            background-size: contain !important;
            filter: none !important;
            box-shadow: 0 24px 70px rgba(0,0,0,.34) !important;
          }

          html body #root .hlc-auth-shell .hlc-auth-brand:has(.hlc-auth-logo-link--artwork) .hlc-auth-brand-story,
          html body #root .hlc-auth-shell .hlc-auth-brand:has(.hlc-auth-logo-link--artwork) .hlc-auth-brand-proof {
            display: none !important;
          }

          @media (max-width: 860px) {
            html body #root .hlc-auth-shell.hlc-auth-shell--flat .hlc-auth-brand:has(.hlc-auth-logo-link--artwork) {
              min-height: 390px !important;
              padding: 34px 20px 42px !important;
              border-bottom: 1px solid rgba(191,211,239,.14) !important;
              background-position: center 42% !important;
            }

            html body #root .hlc-auth-shell .hlc-auth-logo-link--artwork {
              width: min(300px, 82vw) !important;
            }
          }

          @media (max-width: 480px) {
            html body #root .hlc-auth-shell.hlc-auth-shell--flat .hlc-auth-brand:has(.hlc-auth-logo-link--artwork) {
              min-height: 330px !important;
              padding: 28px 18px 34px !important;
            }

            html body #root .hlc-auth-shell .hlc-auth-logo-link--artwork {
              width: min(250px, 78vw) !important;
            }
          }
        `}</style>
      )}

      <section className="hlc-auth-brand" aria-label="HomeLead Connect">
        <a
          className={`hlc-auth-logo-link${usesBrandArtwork ? " hlc-auth-logo-link--artwork" : ""}`}
          href="https://homeleadconnect.org"
          aria-label="Return to HomeLead Connect home"
          style={usesBrandArtwork ? { alignSelf: "center" } : undefined}
        >
          {usesBrandArtwork ? (
            <span
              role="img"
              aria-label={brandImageAlt}
              style={{
                display: "block",
                width: "min(270px, 70vw)",
                aspectRatio: "1 / 1",
                borderRadius: "20px",
                backgroundColor: "#fff",
                backgroundImage: `url(${resolvedBrandImageSrc})`,
                backgroundPosition: "center",
                backgroundRepeat: "no-repeat",
                backgroundSize: "contain",
                boxShadow: "0 24px 58px rgba(0,0,0,.28)",
              }}
            />
          ) : (
            <img src={resolvedBrandImageSrc} alt={brandImageAlt} />
          )}
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
