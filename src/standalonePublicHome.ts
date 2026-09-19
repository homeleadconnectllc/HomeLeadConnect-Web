import "./styles/public-home-owner-authority-20260918.css";
import "./styles/public-footer-home-authority-20260916.css";

const PUBLIC_ORIGIN = "https://homeleadconnect.org";
const APP_ORIGIN = "https://app.homeleadconnect.org";

const pathways = [
  ["resident","For Residents","Find help with the home in front of you—and keep the next step clear.","/homeowners","Find resident support →"],
  ["professional","For Professionals","Grow your business, get more opportunities, and do your best work.","/professionals","Explore professional access →"],
  ["partner","For Partners","Create referral relationships that respect people, context, and consent.","/partners","Explore partner opportunities →"],
  ["community","For Community","Find the people and resources that help build stronger neighborhoods.","/community","Explore community resources →"],
] as const;

const primary = [
  ["Home","/"],["About","/about"],["Residents","/homeowners"],["Professionals","/professionals"],["Partners","/partners"],["Community","/community"],["Resources","/services"],
] as const;
const secondary = [["Services","/services"],["Contact","/contact"],["Accessibility","/accessibility"],["Platform Disclosure","/platform-disclosure"],["Privacy","/privacy"],["Terms","/terms"]] as const;

const esc=(s:string)=>s.replace(/[&<>"']/g,(m)=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]!));
const publicHref=(p:string)=>PUBLIC_ORIGIN+p;

export function mountStandalonePublicHome(root: HTMLElement) {
  root.innerHTML = `
    <main class="hlc-owner-home" data-public-page="home">
      <header class="hlc-board-nav hlc-public-shared-nav" data-hlc-public-navigation="true" data-public-tone="neutral">
        <div class="hlc-board-nav-inner">
          <button type="button" class="hlc-board-brand hlc-public-menu-trigger" aria-label="Open HomeLead Connect menu" aria-expanded="false" aria-controls="hlc-public-menu">
            <img class="hlc-navbar-master-logo" data-hlc-master-logo="true" src="/hlc-logo-ui.png" alt="" aria-hidden="true">
            <span class="hlc-brand-accessible-label">HomeLead Connect</span><span class="hlc-public-menu-cue" aria-hidden="true">☰ <span>Menu</span></span>
          </button>
          <div class="hlc-board-actions"><a class="hlc-board-login" href="${APP_ORIGIN}/login">Sign In</a><a class="hlc-board-cta" href="${APP_ORIGIN}/register">Get Started</a></div>
        </div>
        <div class="hlc-public-menu-backdrop" data-hlc-public-menu-open="true" hidden>
          <nav id="hlc-public-menu" class="hlc-public-menu-panel" aria-label="HomeLead Connect menu">
            <div class="hlc-public-menu-primary">${primary.map(([label,path])=>`<a href="${publicHref(path)}"><span>${esc(label)}</span></a>`).join("")}</div>
            <div class="hlc-public-menu-secondary">${secondary.map(([label,path])=>`<a href="${publicHref(path)}">${esc(label)}</a>`).join("")}</div>
            <div class="hlc-public-menu-account"><a href="${APP_ORIGIN}/login">Sign In</a><a href="${APP_ORIGIN}/register">Get Started</a></div>
          </nav>
        </div>
      </header>
      <section class="hlc-owner-hero" aria-labelledby="hlc-owner-title">
        <picture class="hlc-owner-hero-media" aria-hidden="true"><source media="(max-width: 680px)" srcset="/home-hero-authority-mobile-20260916.webp"><img src="/home-hero-authority-desktop-20260916.webp" alt="" width="1600" height="900" fetchpriority="high" decoding="sync"></picture>
        <div class="hlc-owner-hero-copy"><p class="hlc-owner-kicker">The HomeLead Connect ecosystem</p><h1 id="hlc-owner-title">A stronger community <span>starts here.</span></h1><p class="hlc-owner-tagline">Connecting homes. Creating opportunities.</p><p class="hlc-owner-intro">The people. The services. The partnerships.<br>All in one place to help our communities move forward.</p><p class="hlc-owner-price"><strong>$49.99/month</strong> professional membership</p></div>
        <p class="hlc-owner-script">Stronger Homes. Brighter Futures.<small>Harrisburg, PA</small></p>
      </section>
      <section class="hlc-owner-pathways" aria-label="HomeLead Connect pathways">${pathways.map(([key,title,copy,href,action])=>`<a class="hlc-owner-pathway hlc-owner-pathway--${key}" href="${href}"><span class="hlc-owner-pathway-photo" aria-hidden="true"></span><span class="hlc-owner-pathway-body"><strong>${esc(title)}</strong><span>${esc(copy)}</span><b>${esc(action)}</b></span></a>`).join("")}</section>
      <section class="hlc-owner-mission" aria-label="HomeLead Connect mission"><p>Connecting Homes. Creating Opportunities.</p><div><span>⌂ <b>Stronger Homes</b></span><span>◎ <b>More Opportunities</b></span><span>↔ <b>Thriving Communities</b></span><span>↗ <b>Brighter Futures</b></span></div></section>
    </main>
    <footer class="hlc-public-footer hlc-board-footer hlc-public-footer-home-authority"><strong>HomeLead Connect</strong><span>Connecting Homes. Creating Opportunities.</span><nav aria-label="Legal and accessibility"><a href="${PUBLIC_ORIGIN}/privacy">Privacy</a><a href="${PUBLIC_ORIGIN}/terms">Terms</a><a href="${PUBLIC_ORIGIN}/accessibility">Accessibility</a><a href="${PUBLIC_ORIGIN}/platform-disclosure">Platform disclosure</a></nav><small>© ${new Date().getFullYear()} HomeLead Connect LLC</small></footer>
  `;

  const trigger=root.querySelector<HTMLButtonElement>(".hlc-public-menu-trigger");
  const backdrop=root.querySelector<HTMLElement>(".hlc-public-menu-backdrop");
  const panel=root.querySelector<HTMLElement>(".hlc-public-menu-panel");
  if(!trigger||!backdrop||!panel)return;
  Object.assign(backdrop.style,{position:"fixed",inset:"0",zIndex:"1500",background:"rgba(2,10,22,.78)",padding:"clamp(84px, 10vh, 120px) 18px 24px",overflowY:"auto"});
  Object.assign(panel.style,{width:"min(920px, 100%)",margin:"0 auto",padding:"clamp(24px, 5vw, 54px)",background:"#06182a",border:"1px solid rgba(128,178,225,.32)",borderRadius:"28px",boxShadow:"0 32px 90px rgba(0,0,0,.48)"});
  const close=()=>{backdrop.hidden=true;trigger.setAttribute("aria-expanded","false");trigger.setAttribute("aria-label","Open HomeLead Connect menu");document.body.style.overflow="";trigger.focus()};
  const open=()=>{backdrop.hidden=false;trigger.setAttribute("aria-expanded","true");trigger.setAttribute("aria-label","Close HomeLead Connect menu");document.body.style.overflow="hidden"};
  trigger.addEventListener("click",()=>backdrop.hidden?open():close());
  backdrop.addEventListener("mousedown",(e)=>{if(e.target===backdrop)close()});
  document.addEventListener("keydown",(e)=>{if(e.key==="Escape"&&!backdrop.hidden)close()});
}
