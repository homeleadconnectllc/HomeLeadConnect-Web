import "./styles/public-home-owner-authority-20260918.css";
import { APP_ORIGIN, PUBLIC_ORIGIN } from "./config/siteOrigins";

const pathways = [
  ["resident","For Residents","Find help with the home in front of you—and keep the next step clear.","/homeowners","Find resident support →"],
  ["professional","For Professionals","Grow your business, get more opportunities, and do your best work.","/professionals","Explore professional access →"],
  ["partner","For Partners","Create referral relationships that respect people, context, and consent.","/partners","Explore partner opportunities →"],
  ["community","For Community","Find the people and resources that help build stronger neighborhoods.","/community","Explore community resources →"],
] as const;

const primary = [
  ["Home","/"],["About","/about"],["Residents","/homeowners"],["Professionals","/professionals"],
  ["Partners","/partners"],["Community","/community"],["Resources","/services"],
] as const;
const secondary = [
  ["Services","/services"],["Contact","/contact"],["Accessibility","/accessibility"],
  ["Platform Disclosure","/platform-disclosure"],["Privacy","/privacy"],["Terms","/terms"],
] as const;

function make<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function link(href: string, className?: string, text?: string) {
  const node = make("a", className, text);
  node.href = href;
  return node;
}

export function mountStandalonePublicHome(root: HTMLElement) {
  root.replaceChildren();

  const main = make("main", "hlc-owner-home");
  main.dataset.publicPage = "home";

  const header = make("header", "hlc-board-nav hlc-public-shared-nav");
  header.dataset.hlcPublicNavigation = "true";
  header.dataset.publicTone = "neutral";

  const navInner = make("div", "hlc-board-nav-inner");
  const trigger = make("button", "hlc-board-brand hlc-public-menu-trigger");
  trigger.type = "button";
  trigger.setAttribute("aria-label", "Open HomeLead Connect menu");
  trigger.setAttribute("aria-expanded", "false");
  trigger.setAttribute("aria-controls", "hlc-public-menu");

  const logo = make("img", "hlc-navbar-master-logo");
  logo.dataset.hlcMasterLogo = "true";
  logo.src = "/hlc-logo-ui.png";
  logo.alt = "";
  logo.setAttribute("aria-hidden", "true");
  trigger.append(logo, make("span", "hlc-brand-accessible-label", "HomeLead Connect"));
  const cue = make("span", "hlc-public-menu-cue");
  cue.setAttribute("aria-hidden", "true");
  cue.append(document.createTextNode("☰ "), make("span", undefined, "Menu"));
  trigger.append(cue);

  const actions = make("div", "hlc-board-actions");
  actions.append(link(`${APP_ORIGIN}/login`, "hlc-board-login", "Sign In"), link(`${APP_ORIGIN}/register`, "hlc-board-cta", "Get Started"));
  navInner.append(trigger, actions);

  const backdrop = make("div", "hlc-public-menu-backdrop");
  backdrop.dataset.hlcPublicMenuOpen = "true";
  backdrop.hidden = true;
  const panel = make("nav", "hlc-public-menu-panel");
  panel.id = "hlc-public-menu";
  panel.setAttribute("aria-label", "HomeLead Connect menu");

  const primaryWrap = make("div", "hlc-public-menu-primary");
  for (const [label, path] of primary) {
    const item = link(`${PUBLIC_ORIGIN}${path}`);
    item.append(make("span", undefined, label));
    primaryWrap.append(item);
  }

  const secondaryWrap = make("div", "hlc-public-menu-secondary");
  for (const [label, path] of secondary) {
    const item = link(`${PUBLIC_ORIGIN}${path}`, undefined, label);
    secondaryWrap.append(item);
  }

  const accountWrap = make("div", "hlc-public-menu-account");
  const menuSignIn = link(`${APP_ORIGIN}/login`, undefined, "Sign In");
  const menuStart = link(`${APP_ORIGIN}/register`, undefined, "Get Started");
  accountWrap.append(menuSignIn, menuStart);
  panel.append(primaryWrap, secondaryWrap, accountWrap);
  backdrop.append(panel);
  header.append(navInner, backdrop);

  const hero = make("section", "hlc-owner-hero");
  hero.setAttribute("aria-labelledby", "hlc-owner-title");
  const picture = make("picture", "hlc-owner-hero-media");
  picture.setAttribute("aria-hidden", "true");
  const source = make("source");
  source.media = "(max-width: 680px)";
  source.srcset = "/home-hero-authority-mobile-20260916.webp";
  const heroImg = make("img");
  heroImg.src = "/home-hero-authority-desktop-20260916.webp";
  heroImg.alt = "";
  heroImg.width = 1600;
  heroImg.height = 900;
  heroImg.setAttribute("fetchpriority", "high");
  heroImg.decoding = "sync";
  picture.append(source, heroImg);

  const heroCopy = make("div", "hlc-owner-hero-copy");
  heroCopy.append(make("p", "hlc-owner-kicker", "The HomeLead Connect ecosystem"));
  const h1 = make("h1");
  h1.id = "hlc-owner-title";
  h1.append(document.createTextNode("A stronger community "), make("span", undefined, "starts here."));
  heroCopy.append(h1, make("p", "hlc-owner-tagline", "Connecting homes. Creating opportunities."));
  const intro = make("p", "hlc-owner-intro");
  intro.append(document.createTextNode("The people. The services. The partnerships."), make("br"), document.createTextNode("All in one place to help our communities move forward."));
  heroCopy.append(intro);
  const price = make("p", "hlc-owner-price");
  price.append(make("strong", undefined, "$49.99/month"), document.createTextNode(" professional membership"));
  heroCopy.append(price);
  const script = make("p", "hlc-owner-script", "Stronger Homes. Brighter Futures.");
  script.append(make("small", undefined, "Harrisburg, PA"));
  hero.append(picture, heroCopy, script);

  const pathwaySection = make("section", "hlc-owner-pathways");
  pathwaySection.setAttribute("aria-label", "HomeLead Connect pathways");
  for (const [key, title, copy, href, action] of pathways) {
    const item = link(href, `hlc-owner-pathway hlc-owner-pathway--${key}`);
    const photo = make("span", "hlc-owner-pathway-photo");
    photo.setAttribute("aria-hidden", "true");
    const body = make("span", "hlc-owner-pathway-body");
    body.append(make("strong", undefined, title), make("span", undefined, copy), make("b", undefined, action));
    item.append(photo, body);
    pathwaySection.append(item);
  }

  const mission = make("section", "hlc-owner-mission");
  mission.setAttribute("aria-label", "HomeLead Connect mission");
  mission.append(make("p", undefined, "Connecting Homes. Creating Opportunities."));
  const missionItems = make("div");
  for (const [symbol, label] of [["⌂","Stronger Homes"],["◎","More Opportunities"],["↔","Thriving Communities"],["↗","Brighter Futures"]] as const) {
    const item = make("span");
    item.append(document.createTextNode(symbol + " "), make("b", undefined, label));
    missionItems.append(item);
  }
  mission.append(missionItems);
  main.append(header, hero, pathwaySection, mission);

  const footer = make("footer", "hlc-public-footer hlc-board-footer hlc-public-footer-home-authority");
  const footerLogo = make("img", "hlc-public-footer-master-logo");
  footerLogo.src = "/hlc-logo-ui.png";
  footerLogo.alt = "HomeLead Connect LLC";
  footer.append(footerLogo, make("strong", undefined, "HomeLead Connect"), make("span", undefined, "Connecting Homes. Creating Opportunities."));
  const legal = make("nav");
  legal.setAttribute("aria-label", "Legal and accessibility");
  for (const [label, path] of [["Privacy","/privacy"],["Terms","/terms"],["Accessibility","/accessibility"],["Platform disclosure","/platform-disclosure"]] as const) {
    legal.append(link(`${PUBLIC_ORIGIN}${path}`, undefined, label));
  }
  footer.append(legal, make("small", undefined, `© ${new Date().getFullYear()} HomeLead Connect LLC`));
  root.append(main, footer);


  const close=()=>{backdrop.hidden=true;trigger.setAttribute("aria-expanded","false");trigger.setAttribute("aria-label","Open HomeLead Connect menu");document.body.style.overflow="";trigger.focus()};
  const open=()=>{backdrop.hidden=false;trigger.setAttribute("aria-expanded","true");trigger.setAttribute("aria-label","Close HomeLead Connect menu");document.body.style.overflow="hidden"};
  trigger.addEventListener("click",()=>backdrop.hidden?open():close());
  backdrop.addEventListener("mousedown",(event)=>{if(event.target===backdrop)close()});
  document.addEventListener("keydown",(event)=>{if(event.key==="Escape"&&!backdrop.hidden)close()});
}
