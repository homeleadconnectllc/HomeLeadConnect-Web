import "./styles/mockup-authority-20260924.css";
import "./styles/home-no-glow-20260925.css";
import "./styles/public-full-bleed-20260925.css";
import { APP_ORIGIN, PUBLIC_ORIGIN } from "./config/siteOrigins";

const pathways = [
  ["resident", "For Residents", "Find help with the home in front of you—and keep the next step clear.", "/homeowners", "Find resident support →"],
  ["professional", "For Professionals", "Grow your business, get more opportunities, and do your best work.", "/professionals", "Explore professional access →"],
  ["partner", "For Partners", "Create referral relationships that respect people, context, and consent.", "/partners", "Explore partner opportunities →"],
  ["community", "For Community", "Find the people and resources that help build stronger neighborhoods.", "/community", "Explore community resources →"],
] as const;

const primary = [
  ["Home", "/", "home"],
  ["About", "/about", "about"],
  ["Residents", "/homeowners", "resident"],
  ["Professionals", "/professionals", "professional"],
  ["Partners", "/partners", "partner"],
  ["Community", "/community", "community"],
  ["Resources", "/services", "resources"],
] as const;

const secondary = [
  ["Services", "/services"],
  ["Contact", "/contact"],
  ["Accessibility", "/accessibility"],
  ["Platform Disclosure", "/platform-disclosure"],
  ["Privacy", "/privacy"],
  ["Terms", "/terms"],
] as const;

const focusableSelector = "a[href],button:not([disabled]),[tabindex]:not([tabindex='-1'])";

const menuIcons = {
  home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/></svg>',
  about: '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M12 11v6"/><path d="M12 7h.01"/></svg>',
  resident: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/><path d="M9 20v-6h6v6"/></svg>',
  professional: '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="7" width="18" height="13" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M3 12h18"/><path d="M10 12v2h4v-2"/></svg>',
  partner: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="m11 17 2 2a2.8 2.8 0 0 0 4-4l-3-3"/><path d="m13 7-2-2a2.8 2.8 0 0 0-4 4l3 3"/><path d="m8 12 8-8"/><path d="m16 12-8 8"/></svg>',
  community: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>',
  resources: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z"/></svg>',
} as const;

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

function icon(key: keyof typeof menuIcons) {
  const node = make("span", "hlc-public-menu-icon");
  node.innerHTML = menuIcons[key];
  return node;
}

export function mountStandalonePublicHome(root: HTMLElement) {
  root.replaceChildren();

  const main = make("main", "hcx-shell");
  const header = make("header", "hlc-board-nav");
  header.dataset.menuOpen = "false";
  const navInner = make("div", "hlc-board-nav-inner");
  const trigger = make("button", "hlc-board-brand");
  trigger.type = "button";
  trigger.setAttribute("aria-label", "Open HomeLead Connect menu");
  trigger.setAttribute("aria-expanded", "false");
  trigger.setAttribute("aria-controls", "hlc-public-menu");

  const logo = make("img", "hlc-navbar-master-logo");
  logo.src = "/hlc-logo-ui.png";
  logo.alt = "";
  logo.setAttribute("aria-hidden", "true");
  trigger.append(logo, make("span", "hlc-brand-accessible-label", "HomeLead Connect"));

  const desktop = make("nav", "hlc-public-desktop-links");
  desktop.setAttribute("aria-label", "Public pages");
  for (const [label, path] of primary.slice(1)) desktop.append(link(`${PUBLIC_ORIGIN}${path}`, undefined, label));

  const actions = make("div", "hlc-board-actions");
  actions.append(
    link(`${APP_ORIGIN}/login`, "hlc-board-login", "Sign In"),
    link(`${APP_ORIGIN}/register`, "hlc-board-cta", "Get Started"),
  );
  navInner.append(trigger, desktop, actions);

  const backdrop = make("div", "hlc-public-menu-backdrop");
  backdrop.hidden = true;
  const panel = make("nav", "hlc-public-menu-panel");
  panel.id = "hlc-public-menu";
  panel.setAttribute("aria-label", "HomeLead Connect menu");

  const primaryWrap = make("div", "hlc-public-menu-primary");
  for (const [label, path, tone] of primary) {
    const item = link(`${PUBLIC_ORIGIN}${path}`);
    item.dataset.menuTone = tone;
    item.append(icon(tone), make("span", undefined, label));
    primaryWrap.append(item);
  }

  const secondaryWrap = make("div", "hlc-public-menu-secondary");
  for (const [label, path] of secondary) secondaryWrap.append(link(`${PUBLIC_ORIGIN}${path}`, undefined, label));

  const accountWrap = make("div", "hlc-public-menu-account");
  accountWrap.append(
    link(`${APP_ORIGIN}/login`, undefined, "Sign In"),
    link(`${APP_ORIGIN}/register`, undefined, "Get Started"),
  );
  panel.append(primaryWrap, secondaryWrap, accountWrap);
  backdrop.append(panel);
  header.append(navInner, backdrop);

  const hero = make("section", "hcx-home-hero");
  const picture = make("picture");
  const img = make("img");
  img.src = "/hlc-homepage-hero-welcome-doorway-20260917.webp";
  img.alt = "";
  img.setAttribute("aria-hidden", "true");
  img.setAttribute("fetchpriority", "high");
  picture.append(img);
  const copy = make("div", "hcx-home-copy");
  copy.append(make("p", "hcx-kicker", "The HomeLead Connect ecosystem"));
  const h1 = make("h1");
  h1.append("A stronger community ", make("span", undefined, "starts here."));
  copy.append(
    h1,
    make("p", "hcx-home-tagline", "Connecting homes. Creating opportunities."),
    make("p", "hcx-home-intro", "The people. The services. The partnerships. All in one place to help our communities move forward."),
  );
  const script = make("p", "hcx-script", "Stronger Homes. Brighter Futures.");
  script.append(make("small", undefined, "Harrisburg, PA"));
  hero.append(picture, copy, script);

  const pathSection = make("section", "hcx-pathway-links");
  pathSection.setAttribute("aria-label", "HomeLead Connect pathways");
  for (const [key, title, body, href, action] of pathways) {
    const item = link(href, "hcx-pathway-link");
    item.dataset.tone = key;
    const content = make("span");
    content.append(make("strong", undefined, title), make("span", undefined, body), make("b", undefined, action));
    item.append(content);
    pathSection.append(item);
  }

  const mission = make("section", "hcx-mission");
  mission.append(make("p", undefined, "Connecting Homes. Creating Opportunities."));
  const missionItems = make("div");
  for (const label of ["Stronger Homes", "More Opportunities", "Thriving Communities", "Brighter Futures"]) {
    missionItems.append(make("span", undefined, label));
  }
  mission.append(missionItems);
  main.append(header, hero, pathSection, mission);

  const footer = make("footer", "hlc-public-footer");
  const footerLogo = make("img", "hlc-public-footer-master-logo");
  footerLogo.src = "/hlc-logo-ui.png";
  footerLogo.alt = "HomeLead Connect LLC";
  footer.append(
    footerLogo,
    make("strong", undefined, "HomeLead Connect"),
    make("span", undefined, "Connecting Homes. Creating Opportunities."),
  );
  const legal = make("nav");
  legal.setAttribute("aria-label", "Legal and accessibility");
  for (const [label, path] of [
    ["Privacy", "/privacy"],
    ["Terms", "/terms"],
    ["Accessibility", "/accessibility"],
    ["Platform disclosure", "/platform-disclosure"],
  ] as const) {
    legal.append(link(`${PUBLIC_ORIGIN}${path}`, undefined, label));
  }
  footer.append(legal, make("small", undefined, `© ${new Date().getFullYear()} HomeLead Connect LLC`));
  root.append(main, footer);

  let priorOverflow = document.body.style.overflow;

  const getMenuControls = () => Array.from(panel.querySelectorAll<HTMLElement>(focusableSelector))
    .filter((element) => !element.hasAttribute("disabled") && element.tabIndex !== -1);

  const close = (restoreFocus = true) => {
    backdrop.hidden = true;
    header.dataset.menuOpen = "false";
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-label", "Open HomeLead Connect menu");
    document.body.style.overflow = priorOverflow;
    if (restoreFocus) window.requestAnimationFrame(() => trigger.focus());
  };

  const open = () => {
    priorOverflow = document.body.style.overflow;
    backdrop.hidden = false;
    header.dataset.menuOpen = "true";
    trigger.setAttribute("aria-expanded", "true");
    trigger.setAttribute("aria-label", "Close HomeLead Connect menu");
    document.body.style.overflow = "hidden";
    window.requestAnimationFrame(() => getMenuControls()[0]?.focus());
  };

  trigger.addEventListener("click", () => backdrop.hidden ? open() : close());
  backdrop.addEventListener("pointerdown", (event) => {
    if (event.target === backdrop) close();
  });
  document.addEventListener("keydown", (event) => {
    if (backdrop.hidden) return;
    if (event.key === "Escape") {
      event.preventDefault();
      close();
      return;
    }
    if (event.key !== "Tab") return;
    const controls = getMenuControls();
    if (controls.length === 0) return;
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  });
}
