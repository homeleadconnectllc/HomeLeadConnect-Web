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
      <style>{`
        html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login { min-width:0 !important; background:#f8fafc !important; color:#0f172a !important; }
        html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login > .hlc-route-content { width:100% !important; max-width:none !important; min-width:0 !important; padding:0 !important; background:#f8fafc !important; overflow:visible !important; }
        html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login .hlc-auth-shell.hlc-auth-shell--flat { box-sizing:border-box !important; display:block !important; position:relative !important; width:100vw !important; max-width:none !important; min-width:100vw !important; min-height:100vh !important; margin:0 0 0 calc(50% - 50vw) !important; padding:0 0 40px !important; overflow:visible !important; border:0 !important; border-radius:0 !important; background:#f8fafc !important; box-shadow:none !important; color:#0f172a !important; }
        html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login .hlc-auth-public-nav { background:#ffffff !important; border-bottom:1px solid #e2e8f0 !important; color:#0f172a !important; }
        html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login .hlc-auth-public-nav-inner { background:#ffffff !important; }
        html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login .hlc-auth-public-links a { color:#334155 !important; -webkit-text-fill-color:#334155 !important; }
        html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login .hlc-auth-public-links .hlc-auth-public-request { color:#ffffff !important; -webkit-text-fill-color:#ffffff !important; background:#2563eb !important; }
        html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login .hlc-auth-shell.hlc-auth-shell--flat .hlc-auth-main { display:grid !important; grid-template-columns:minmax(0,1fr) minmax(420px,520px) !important; grid-template-rows:auto !important; align-items:center !important; justify-items:stretch !important; gap:clamp(48px,7vw,96px) !important; width:min(1180px,calc(100vw - 32px)) !important; max-width:1180px !important; min-height:calc(100vh - 112px) !important; margin:0 auto !important; padding:56px 0 48px !important; background:transparent !important; overflow:visible !important; }
        html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login .hlc-auth-shell.hlc-auth-shell--flat .hlc-auth-intro { display:block !important; grid-column:1 !important; grid-row:1 !important; position:relative !important; width:auto !important; max-width:600px !important; min-width:0 !important; align-self:center !important; justify-self:stretch !important; visibility:visible !important; opacity:1 !important; transform:none !important; }
        html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login .hlc-auth-shell.hlc-auth-shell--flat .hlc-auth-card { display:grid !important; grid-column:2 !important; grid-row:1 !important; position:relative !important; width:100% !important; max-width:520px !important; min-width:0 !important; min-height:0 !important; margin:0 !important; padding:32px !important; align-self:center !important; justify-self:stretch !important; border:1px solid #1e3345 !important; border-radius:20px !important; background:#0f1b27 !important; color:#f8fafc !important; box-shadow:0 24px 60px rgba(15,23,42,.16) !important; visibility:visible !important; opacity:1 !important; transform:none !important; z-index:2 !important; }
        html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login .hlc-auth-shell.hlc-auth-shell--flat .hlc-auth-form label, html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login .hlc-auth-shell.hlc-auth-shell--flat .hlc-auth-form .hlc-password-field>span:first-child { color:#e5edf7 !important; -webkit-text-fill-color:#e5edf7 !important; visibility:visible !important; opacity:1 !important; }
        html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login .hlc-auth-shell.hlc-auth-shell--flat .hlc-auth-form .hlc-password-field>span:first-child { display:block !important; height:auto !important; margin:0 !important; line-height:1.35 !important; }
        @media(max-width:800px){ html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login .hlc-auth-shell.hlc-auth-shell--flat .hlc-auth-main { grid-template-columns:1fr !important; width:min(760px,calc(100vw - 32px)) !important; max-width:760px !important; min-height:auto !important; padding:44px 0 40px !important; gap:24px !important; } html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login .hlc-auth-shell.hlc-auth-shell--flat .hlc-auth-card { grid-column:1 !important; grid-row:1 !important; max-width:520px !important; justify-self:center !important; align-self:start !important; } }
        @media(max-width:720px){ html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login .hlc-auth-shell.hlc-auth-shell--flat { min-height:100vh !important; padding:0 0 24px !important; } html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login .hlc-auth-shell.hlc-auth-shell--flat .hlc-auth-main { display:block !important; width:calc(100vw - 24px) !important; max-width:none !important; min-height:auto !important; margin:0 auto !important; padding:24px 0 0 !important; } html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login .hlc-auth-shell.hlc-auth-shell--flat .hlc-auth-intro { display:none !important; } html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login .hlc-auth-shell.hlc-auth-shell--flat .hlc-auth-card { display:grid !important; width:100% !important; max-width:none !important; padding:24px 18px !important; border-radius:18px !important; } }
      `}</style>
      <nav className="hlc-auth-public-nav" aria-label="Public site navigation">
        <div className="hlc-auth-public-nav-inner">
          <a className="hlc-auth-public-brand" href="https://homeleadconnect.org/" aria-label="HomeLead Connect home">
            <img src="/hlc-logo-transparent.png" alt="HomeLead Connect" width="48" height="48" />
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

      <div className="hlc-auth-main">
        <section className="hlc-auth-intro" aria-label="HomeLead Connect account overview">
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
    </main>
  );
}
