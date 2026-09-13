import type { ReactNode } from "react";
import "../../styles/public-auth-visual-closure-20260912.css";

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
        html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login { min-width:0 !important; background:#020a15 !important; color:#f7fbff !important; }
        html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login > .hlc-route-content { width:100% !important; max-width:none !important; min-width:0 !important; padding:0 !important; background:#020a15 !important; overflow:visible !important; }
        html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login .hlc-auth-shell.hlc-auth-shell--flat {
          box-sizing:border-box !important;
          display:block !important;
          position:relative !important;
          width:100vw !important;
          max-width:none !important;
          min-width:100vw !important;
          min-height:100vh !important;
          margin:0 0 0 calc(50% - 50vw) !important;
          padding:0 !important;
          overflow:hidden !important;
          border:0 !important;
          border-radius:0 !important;
          background-color:#020a15 !important;
          background-image:
            linear-gradient(90deg,rgba(2,9,20,.28) 0%,rgba(2,9,20,.54) 44%,rgba(2,9,20,.91) 72%,rgba(2,9,20,.97) 100%),
            url('https://upload.wikimedia.org/wikipedia/commons/a/a7/Harrisburg_PA_skyline.jpg') !important;
          background-position:center center !important;
          background-size:cover !important;
          background-repeat:no-repeat !important;
          box-shadow:none !important;
          color:#f7fbff !important;
        }
        html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login .hlc-auth-shell.hlc-auth-shell--flat::before {
          content:"";
          position:absolute;
          inset:0;
          pointer-events:none;
          background:linear-gradient(180deg,rgba(2,9,20,.04),transparent 48%,rgba(2,9,20,.28));
          z-index:0;
        }
        html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login .hlc-auth-shell.hlc-auth-shell--flat > .hlc-auth-public-nav {
          position:relative !important;
          z-index:50 !important;
          isolation:isolate !important;
          background:#031225 !important;
          border-bottom:1px solid rgba(151,187,222,.16) !important;
          color:#f7fbff !important;
          box-shadow:none !important;
          backdrop-filter:none !important;
        }
        html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login .hlc-auth-shell.hlc-auth-shell--flat > .hlc-auth-public-nav .hlc-auth-public-nav-inner { background:transparent !important; }
        html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login .hlc-auth-shell.hlc-auth-shell--flat > .hlc-auth-public-nav .hlc-auth-public-brand {
          display:flex !important;
          align-items:center !important;
          justify-content:center !important;
          width:52px !important;
          height:52px !important;
          overflow:hidden !important;
          border-radius:50% !important;
          background:transparent !important;
        }
        html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login .hlc-auth-shell.hlc-auth-shell--flat > .hlc-auth-public-nav .hlc-auth-public-brand img {
          display:block !important;
          width:52px !important;
          height:52px !important;
          max-width:52px !important;
          max-height:52px !important;
          object-fit:cover !important;
          border-radius:50% !important;
          clip-path:circle(50% at 50% 50%) !important;
          padding:0 !important;
          background:transparent !important;
        }
        html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login .hlc-auth-shell.hlc-auth-shell--flat > .hlc-auth-public-nav .hlc-auth-public-links a { color:#d7e5f2 !important; -webkit-text-fill-color:#d7e5f2 !important; background:transparent !important; }
        html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login .hlc-auth-shell.hlc-auth-shell--flat > .hlc-auth-public-nav .hlc-auth-public-links a.hlc-auth-public-request { color:#8ff0c8 !important; -webkit-text-fill-color:#8ff0c8 !important; border:1px solid rgba(143,240,200,.62) !important; background:transparent !important; }
        html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login .hlc-auth-shell.hlc-auth-shell--flat .hlc-auth-main {
          position:relative !important;
          z-index:2 !important;
          display:grid !important;
          grid-template-columns:minmax(0,1fr) minmax(420px,520px) !important;
          grid-template-rows:auto !important;
          align-items:center !important;
          justify-items:stretch !important;
          gap:clamp(54px,8vw,110px) !important;
          width:min(1180px,calc(100vw - 48px)) !important;
          max-width:1180px !important;
          min-height:calc(100vh - 74px) !important;
          margin:0 auto !important;
          padding:64px 0 56px !important;
          background:transparent !important;
          overflow:visible !important;
        }
        html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login .hlc-auth-shell.hlc-auth-shell--flat .hlc-auth-intro {
          display:block !important;
          grid-column:1 !important;
          grid-row:1 !important;
          position:relative !important;
          width:auto !important;
          max-width:580px !important;
          min-width:0 !important;
          align-self:center !important;
          justify-self:stretch !important;
          padding:0 0 0 34px !important;
          border-left:2px solid rgba(117,215,255,.72) !important;
          visibility:visible !important;
          opacity:1 !important;
          transform:none !important;
        }
        html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login .hlc-auth-shell.hlc-auth-shell--flat .hlc-auth-intro h2 {
          margin:10px 0 16px !important;
          color:#fff !important;
          font-family:Georgia,"Times New Roman",serif !important;
          font-size:clamp(44px,5vw,72px) !important;
          font-weight:500 !important;
          line-height:.98 !important;
          letter-spacing:-.045em !important;
          text-wrap:balance !important;
        }
        html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login .hlc-auth-shell.hlc-auth-shell--flat .hlc-auth-card {
          display:grid !important;
          grid-column:2 !important;
          grid-row:1 !important;
          position:relative !important;
          width:100% !important;
          max-width:520px !important;
          min-width:0 !important;
          min-height:0 !important;
          margin:0 !important;
          padding:28px 10px 28px 26px !important;
          align-self:center !important;
          justify-self:stretch !important;
          border:0 !important;
          border-radius:0 !important;
          background:transparent !important;
          color:#f8fafc !important;
          box-shadow:none !important;
          backdrop-filter:none !important;
          -webkit-backdrop-filter:none !important;
          visibility:visible !important;
          opacity:1 !important;
          transform:none !important;
          z-index:2 !important;
        }
        html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login .hlc-auth-shell.hlc-auth-shell--flat .hlc-auth-card::before,
        html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login .hlc-auth-shell.hlc-auth-shell--flat .hlc-auth-card::after { display:none !important; }
        html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login .hlc-auth-shell.hlc-auth-shell--flat .hlc-auth-form-heading { text-align:center !important; }
        html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login .hlc-auth-shell.hlc-auth-shell--flat .hlc-auth-form label,
        html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login .hlc-auth-shell.hlc-auth-shell--flat .hlc-auth-form .hlc-password-field>span:first-child { color:#e5edf7 !important; -webkit-text-fill-color:#e5edf7 !important; visibility:visible !important; opacity:1 !important; }
        html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login .hlc-auth-shell.hlc-auth-shell--flat .hlc-auth-form input {
          background:rgba(3,18,35,.78) !important;
          color:#fff !important;
          -webkit-text-fill-color:#fff !important;
          border:1px solid rgba(144,190,233,.34) !important;
          box-shadow:none !important;
        }
        @media(max-width:800px){
          html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login .hlc-auth-shell.hlc-auth-shell--flat {
            min-height:100svh !important;
            background-image:
              linear-gradient(180deg,rgba(2,9,20,.12) 0%,rgba(2,9,20,.34) 27%,rgba(2,9,20,.86) 50%,#020a15 70%),
              url('https://upload.wikimedia.org/wikipedia/commons/a/a7/Harrisburg_PA_skyline.jpg') !important;
            background-position:center top !important;
            background-size:auto 52vh !important;
          }
          html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login .hlc-auth-shell.hlc-auth-shell--flat .hlc-auth-main {
            display:block !important;
            width:calc(100vw - 32px) !important;
            max-width:none !important;
            min-height:100svh !important;
            margin:0 auto !important;
            padding:34vh 0 36px !important;
          }
          html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login .hlc-auth-shell.hlc-auth-shell--flat .hlc-auth-intro { display:none !important; }
          html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login .hlc-auth-shell.hlc-auth-shell--flat .hlc-auth-card {
            display:grid !important;
            width:100% !important;
            max-width:none !important;
            padding:20px 8px 24px !important;
            border:0 !important;
            border-radius:0 !important;
            background:transparent !important;
            box-shadow:none !important;
          }
          html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login .hlc-auth-shell.hlc-auth-shell--flat > .hlc-auth-public-nav .hlc-auth-public-links a:not(.hlc-auth-public-request) { display:none !important; }
          html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login .hlc-auth-shell.hlc-auth-shell--flat > .hlc-auth-public-nav .hlc-auth-public-links .hlc-auth-public-request { display:inline-flex !important; min-height:40px !important; margin-left:0 !important; padding-inline:13px !important; }
        }
      `}</style>
      <nav className="hlc-auth-public-nav" aria-label="Public site navigation">
        <div className="hlc-auth-public-nav-inner">
          <a className="hlc-auth-public-brand" href="https://homeleadconnect.org/" aria-label="HomeLead Connect home">
            <img src="/hlc-logo-transparent.png" alt="HomeLead Connect" width="52" height="52" />
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
