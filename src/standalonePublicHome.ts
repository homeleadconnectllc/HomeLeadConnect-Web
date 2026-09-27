import "./styles/mockup-authority-20260924.css";
import "./styles/home-no-glow-20260925.css";
import "./styles/public-full-bleed-20260925.css";
import "./styles/home-pathway-defer-20260926.css";
import "./styles/base44-story-adaptation-20260927.css";
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
const svgNamespace = "http://www.w3.org/2000/svg";

type IconPrimitive = readonly [tag: "path" | "circle" | "rect", attributes: Readonly<Record<string, string>>];

const menuIcons: Readonly<Record<(typeof primary)[number][2], readonly IconPrimitive[]>> = {
  home: [
    ["path", { d: "m3 11 9-8 9 8" }],
    ["path", { d: "M5 10v10h14V10" }],
    ["path", { d: "M9 20v-6h6v6" }],
  ],
  about: [
    ["circle", { cx: "12", cy: "12", r: "9" }],
    ["path", { d: "M12 11v6" }],
    ["path", { d: "M12 7h.01" }],
  ],
  resident: [
    ["path", { d: "m3 11 9-8 9 8" }],
    ["path", { d: "M5 10v10h14V10" }],
    ["path", { d: "M9 20v-6h6v6" }],
  ],
  professional: [
    ["rect", { x: "3", y: "7", width: "18", height: "13", rx: "2" }],
    ["path", { d: "M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" }],
    ["path", { d: "M3 12h18" }],
    ["path", { d: "M10 12v2h4v-2" }],
  ],
  partner: [
    ["path", { d: "m11 17 2 2a2.8 2.8 0 0 0 4-4l-3-3" }],
    ["path", { d: "m13 7-2-2a2.8 2.8 0 0 0-4 4l3 3" }],
    ["path", { d: "m8 12 8-8" }],
    ["path", { d: "m16 12-8 8" }],
  ],
  community: [
    ["path", { d: "M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" }],
    ["circle", { cx: "9", cy: "7", r: "4" }],
    ["path", { d: "M22 21v-2a4 4 0 0 0-3-3.87" }],
    ["path", { d: "M16 3.13a4 4 0 0 1 0 7.75" }],
  ],
  resources: [
    ["path", { d: "M4 19.5A2.5 2.5 0 0 1 6.5 17H20" }],
    ["path", { d: "M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2Z" }],
  ],
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
  const svg = document.createElementNS(svgNamespace, "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  for (const [tag, attributes] of menuIcons[key]) {
    const primitive = document.createElementNS(svgNamespace, tag);
    for (const [name, value] of Object.entries(attributes)) primitive.setAttribute(name, value);
    svg.append(primitive);
  }
  node.append(svg);
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
  for (const [label, path, tone] of primary.slice(1)) {
    const item = link(`${PUBLIC_ORIGIN}${path}`, undefined, label);
    item.dataset.menuTone = tone;
    desktop.append(item);
  }

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

  // Adapt the published layout lab's narrative order using HCX-owned copy,
  // destinations, and imagery. This is presentation only; no Base44 runtime.
  const journey = make("section", "hcx-story-journey");
  journey.setAttribute("aria-labelledby", "hcx-story-journey-title");
  const journeyIntro = make("div", "hcx-story-intro");
  journeyIntro.append(make("p", "hcx-story-kicker", "The journey"));
  const journeyTitle = make("h2", undefined, "From a home need to work completed.");
  journeyTitle.id = "hcx-story-journey-title";
  journeyIntro.append(journeyTitle, make("p", undefined, "Four connected steps keep the request, opportunity, work, and follow-through together."));
  const journeySteps = make("ol", "hcx-story-steps");
  for (const [title, detail] of [
    ["A resident shares the need", "Describe the home project and add the details that help clarify the next step."],
    ["The request takes shape", "HomeLead Connect organizes useful context before it reaches a professional."],
    ["A professional connects", "The right people can review the opportunity and coordinate the work."],
    ["The work moves forward", "Communication and records keep the journey connected through follow-through."],
  ]) {
    const step = make("li");
    step.append(make("h3", undefined, title), make("p", undefined, detail));
    journeySteps.append(step);
  }
  journey.append(journeyIntro, journeySteps);

  const audience = make("section", "hcx-story-audiences");
  audience.setAttribute("aria-label", "Residents and professionals");
  for (const [family, kicker, title, detail, image, destination, action] of [
    ["resident", "For residents", "Start with the problem in front of you.", "Share what the home needs once, then keep the request and next step clear as the work moves forward.", "/page-residents-request-help-20260916.webp", "/homeowners", "Explore resident support →"],
    ["professional", "For professionals", "Find opportunities with useful context.", "Bring your service business into a connected experience for opportunity, scheduling, work, and follow-through.", "/page-professionals-provider-presence-20260916.webp", "/professionals", "Explore professional access →"],
  ]) {
    const section = make("article", "hcx-story-audience");
    section.dataset.family = family;
    const body = make("div", "hcx-story-audience-copy");
    body.append(make("p", "hcx-story-kicker", kicker), make("h2", undefined, title), make("p", undefined, detail), link(destination, "hcx-story-link", action));
    const photo = make("img");
    photo.src = image;
    photo.alt = family === "resident" ? "Resident and service professional reviewing a home request" : "Home service professionals coordinating a residential project";
    photo.loading = "lazy";
    section.append(body, photo);
    audience.append(section);
  }

  const pathSection = make("section", "hcx-pathway-links");
  pathSection.setAttribute("aria-label", "HomeLead Connect pathways");
  for (const [key, title, body, href, action] of pathways) {
    const item = link(href, "hcx-pathway-link");
    item.dataset.tone = key;
    item.dataset.mediaReady = "false";
    const content = make("span");
    content.append(make("strong", undefined, title), make("span", undefined, body));
    if (key === "professional") {
      content.append(make("small", "hcx-pathway-price", "$49.99/month professional membership"));
    }
    content.append(make("b", undefined, action));
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
  main.append(header, hero, journey, audience, pathSection, mission);

  const footer = make("footer", "hlc-public-footer");
  footer.append(
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

  const deferredPathwayMedia = Array.from(pathSection.querySelectorAll<HTMLElement>(".hcx-pathway-link[data-media-ready='false']"));
  if ("IntersectionObserver" in window) {
    const mediaObserver = new IntersectionObserver((entries, observer) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        (entry.target as HTMLElement).dataset.mediaReady = "true";
        observer.unobserve(entry.target);
      }
    }, { rootMargin: "96px 0px", threshold: 0.01 });
    for (const card of deferredPathwayMedia) mediaObserver.observe(card);
  } else {
    for (const card of deferredPathwayMedia) card.dataset.mediaReady = "true";
  }

  let priorOverflow = document.body.style.overflow;

  const getMenuControls = () => Array.from(panel.querySelectorAll<HTMLElement>(focusableSelector))
    .filter((element) => !element.hasAttribute("disabled") && element.tabIndex !== -1);

  const close = (restoreFocus = true) => {
    backdrop.hidden = true;
    header.dataset.menuOpen = "false";
    trigger.setAttribute("aria-expanded", "false");
    trigger.setAttribute("aria-label", "Open HomeLead Connect menu");
    document.body.style.overflow = priorOverflow;
    if (restoreFocus) trigger.focus();
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
