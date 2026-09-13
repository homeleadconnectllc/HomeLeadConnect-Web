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

const HARRISBURG_SKYLINE = "https://upload.wikimedia.org/wikipedia/commons/a/a7/Harrisburg_PA_skyline.jpg";
const HARRISBURG_FALLBACK = "/harrisburg-login-skyline.svg";

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
        html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login {
          min-width:0 !important;
          background:#020a15 !important;
          color:#f7fbff !important;
        }
        html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login > .hlc-route-content {
          width:100% !important;
          max-width:none !important;
          min-width:0 !important;
          padding:0 !important;
          background:#020a15 !important;
          overflow:visible !important;
        }
        html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login .hlc-auth-shell.hlc-auth-shell--flat {
          box-sizing:border-box !important;
          display:block !important;
          position:relative !important;
          isolation:isolate !important;
          width:100vw !important;
          max-width:none !important;
          min-width:100vw !important;
          min-height:100svh !important;
          margin:0 0 0 calc(50% - 50vw) !important;
          padding:0 !important;
          overflow:hidden !important;
          border:0 !important;
          border-radius:0 !important;
          background:#020a15 !important;
          box-shadow:none !important;
          color:#f7fbff !important;
        }
        html body #root .hlc-auth-shell .hlc-auth-city-media {
          position:absolute !important;
          z-index:-3 !important;
          inset:0 !important;
          display:block !important;
          width:100% !important;
          height:100% !important;
          min-height:100% !important;
          object-fit:cover !important;
          object-position:center center !important;
          opacity:1 !important;
          transform:none !important;
          filter:saturate(.92) contrast(1.04) brightness(.78) !important;
          pointer-events:none !important;
        }
        html body #root .hlc-auth-shell .hlc-auth-city-shade {
          position:absolute !important;
          z-index:-2 !important;
          inset:0 !important;
          pointer-events:none !important;
          background:linear-gradient(90deg,rgba(2,9,20,.20) 0%,rgba(2,9,20,.50) 42%,rgba(2,9,20,.88) 70%,rgba(2,9,20,.97) 100%) !important;
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
        html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login .hlc-auth-shell.hlc-auth-shell--flat > .hlc-auth-public-nav .hlc-auth-public-nav-inner {
          background:transparent !important;
        }
        html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login .hlc-auth-shell.hlc-auth-shell--flat > .hlc-auth-public-nav .hlc-auth-public-brand {
          display:flex !important;
          align-items:center !important;
          justify-content:center !important;
          width:54px !important;
          height:54px !important;
          overflow:hidden !important;
          border-radius:50% !important;
          background:#fff !important;
          box-shadow:0 0 0 1px rgba(255,255,255,.72) !important;
        }
        html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login .hlc-auth-shell.hlc-auth-shell--flat > .hlc-auth-public-nav .hlc-auth-public-brand img {
          display:block !important;
          width:54px !important;
          height:54px !important;
          max-width:54px !important;
          max-height:54px !important;
          object-fit:cover !important;
          border-radius:50% !important;
          clip-path:circle(50% at 50% 50%) !important;
          padding:0 !important;
          background:transparent !important;
        }
        html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login .hlc-auth-shell.hlc-auth-shell--flat > .hlc-auth-public-nav .hlc-auth-public-links a {
          color:#d7e5f2 !important;
          -webkit-text-fill-color:#d7e5f2 !important;
          background:transparent !important;
        }
        html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login .hlc-auth-shell.hlc-auth-shell--flat > .hlc-auth-public-nav .hlc-auth-public-links a.hlc-auth-public-request {
          color:#8ff0c8 !important;
          -webkit-text-fill-color:#8ff0c8 !important;
          border:0 !important;
          background:transparent !important;
        }
        html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login .hlc-auth-shell.hlc-auth-shell--flat .hlc-auth-main {
          position:relative !important;
          z-index:2 !important;
          display:grid !important;
          grid-template-columns:minmax(0,1fr) minmax(400px,500px) !important;
          grid-template-rows:auto !important;
          align-items:center !important;
          justify-items:stretch !important;
          gap:clamp(58px,8vw,112px) !important;
          width:min(1180px,calc(100vw - 48px)) !important;
          max-width:1180px !important;
          min-height:calc(100svh - 78px) !important;
          margin:0 auto !important;
          padding:64px 0 58px !important;
          background:transparent !important;
          overflow:visible !important;
        }
        html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login .hlc-auth-shell.hlc-auth-shell--flat .hlc-auth-intro {
          display:block !important;
          grid-column:1 !important;
          grid-row:1 !important;
          position:relative !important;
          width:auto !important;
          max-width:590px !important;
          min-width:0 !important;
          align-self:center !important;
          justify-self:stretch !important;
          padding:0 0 0 32px !important;
          border-left:2px solid rgba(117,215,255,.72) !important;
          visibility:visible !important;
          opacity:1 !important;
          transform:none !important;
          text-shadow:0 2px 18px rgba(0,0,0,.60) !important;
        }
        html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login .hlc-auth-shell.hlc-auth-shell--flat .hlc-auth-intro h2 {
          margin:10px 0 16px !important;
          color:#fff !important;
          -webkit-text-fill-color:#fff !important;
          font-family:Georgia,"Times New Roman",serif !important;
          font-size:clamp(44px,5vw,72px) !important;
          font-weight:500 !important;
          line-height:.98 !important;
          letter-spacing:-.045em !important;
          text-wrap:balance !important;
        }
        html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login .hlc-auth-shell.hlc-auth-shell--flat .hlc-auth-intro p,
        html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login .hlc-auth-shell.hlc-auth-shell--flat .hlc-auth-intro span {
          color:#f2f7fd !important;
          -webkit-text-fill-color:#f2f7fd !important;
        }
        html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login .hlc-auth-shell.hlc-auth-shell--flat .hlc-auth-card {
          display:grid !important;
          grid-column:2 !important;
          grid-row:1 !important;
          position:relative !important;
          width:100% !important;
          max-width:500px !important;
          min-width:0 !important;
          min-height:0 !important;
          margin:0 !important;
          padding:28px 4px 28px 20px !important;
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
        html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login .hlc-auth-shell.hlc-auth-shell--flat .hlc-auth-card::after {
          display:none !important;
        }
        html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login .hlc-auth-shell.hlc-auth-shell--flat .hlc-auth-form-heading {
          text-align:center !important;
        }
        html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login .hlc-auth-shell.hlc-auth-shell--flat .hlc-auth-form label,
        html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login .hlc-auth-shell.hlc-auth-shell--flat .hlc-auth-form .hlc-password-field>span:first-child {
          color:#e5edf7 !important;
          -webkit-text-fill-color:#e5edf7 !important;
          visibility:visible !important;
          opacity:1 !important;
        }
        html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login .hlc-auth-shell.hlc-auth-shell--flat .hlc-auth-form input {
          background:rgba(2,12,25,.74) !important;
          color:#fff !important;
          -webkit-text-fill-color:#fff !important;
          border:1px solid rgba(144,190,233,.38) !important;
          border-radius:8px !important;
          box-shadow:none !important;
        }
        @media(max-width:800px){
          html body #root .hlc-auth-shell .hlc-auth-city-media {
            inset:72px 0 auto 0 !important;
            height:42vh !important;
            min-height:300px !important;
            object-position:center center !important;
            filter:saturate(.96) contrast(1.04) brightness(.82) !important;
          }
          html body #root .hlc-auth-shell .hlc-auth-city-shade {
            inset:72px 0 auto 0 !important;
            height:48vh !important;
            min-height:340px !important;
            background:linear-gradient(180deg,rgba(2,9,20,.08) 0%,rgba(2,9,20,.24) 42%,rgba(2,9,20,.82) 76%,#020a15 100%) !important;
          }
          html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login .hlc-auth-shell.hlc-auth-shell--flat .hlc-auth-main {
            display:block !important;
            width:calc(100vw - 32px) !important;
            max-width:none !important;
            min-height:100svh !important;
            margin:0 auto !important;
            padding:34vh 0 36px !important;
          }
          html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login .hlc-auth-shell.hlc-auth-shell--flat .hlc-auth-intro {
            display:none !important;
          }
          html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login .hlc-auth-shell.hlc-auth-shell--flat .hlc-auth-card {
            display:grid !important;
            width:100% !important;
            max-width:540px !important;
            margin-inline:auto !important;
            padding:20px 8px 24px !important;
            border:0 !important;
            border-radius:0 !important;
            background:transparent !important;
            box-shadow:none !important;
          }
          html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login .hlc-auth-shell.hlc-auth-shell--flat > .hlc-auth-public-nav .hlc-auth-public-links a:not(.hlc-auth-public-request) {
            display:none !important;
          }
          html body #root .hlc-app-shell.hlc-public-shell.hlc-page-login .hlc-auth-shell.hlc-auth-shell--flat > .hlc-auth-public-nav .hlc-auth-public-links .hlc-auth-public-request {
            display:inline-flex !important;
            min-height:40px !important;
            margin-left:0 !important;
            padding-inline:0 !important;
          }
        }
      `}</style>

      <img
        className="hlc-auth-city-media"
        src={HARRISBURG_SKYLINE}
        alt="Harrisburg, Pennsylvania skyline across the Susquehanna River"
        referrerPolicy="no-referrer"
        onError={(event) => {
          const image = event.currentTarget;
          if (!image.src.endsWith(HARRISBURG_FALLBACK)) image.src = HARRISBURG_FALLBACK;
        }}
      />
      <div className="hlc-auth-city-shade" aria-hidden="true" />

      <nav className="hlc-auth-public-nav" aria-label="Public site navigation">
        <div className="hlc-auth-public-nav-inner">
          <a className="hlc-auth-public-brand" href="https://homeleadconnect.org/" aria-label="HomeLead Connect home">
            <img src="/hlc-logo-transparent.png" alt="HomeLead Connect" width="54" height="54" />
          </a>
          <div className="hlc-auth-public-links">
            <a href="https://homeleadconnect.org/homeowners">Residents</a>
            <a href="https://homeleadconnect.org/professionals">Professionals</a>
            <a href="https://homeleadconnect.org/partners">Partners</a>
            <a href="https://homeleadconnect.org/services">Resources</a>
            <a href="https://homeleadconnect.org/about">About</a>
            <a href="https://homeleadconnect.org/contact">Contact</a>
            <a className="hlc-auth-public-request" href="https://app.homeleadconnect.org/request-service">Request service</a>
          </div>
        </div>
      </nav>

      <div className="hlc-auth-main">
        <section className="hlc-auth-intro" aria-label="HomeLead Connect account overview">
          <p className="hlc-auth-intro-kicker">Harrisburg · Home services, connected better</p>
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
