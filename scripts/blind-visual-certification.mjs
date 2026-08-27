import { chromium } from 'playwright';
import { readFile, readdir, writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const dist = new URL('../dist/', import.meta.url);
const assetsDir = new URL('../dist/assets/', import.meta.url);
const outDir = new URL('../artifacts/blind-visual/', import.meta.url);
await mkdir(outDir, { recursive: true });

const files = await readdir(assetsDir);
const authCssName = files.find((name) => /^AuthenticatedStyles-.*\.css$/.test(name));
if (!authCssName) throw new Error('AuthenticatedStyles CSS bundle not found. Run npm run build first.');
const authCss = await readFile(new URL(`../dist/assets/${authCssName}`, import.meta.url), 'utf8');

const fixtureHtml = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>${authCss}</style><style>html,body{margin:0} body{background:#071426;color:#f8fbff}.fixture-spacer{height:32px}</style></head><body><div id="root"><div class="hlc-app-shell hlc-signed-in-shell hlc-page-leads"><nav class="hlc-navbar"><a class="hlc-navbar-brand"><div class="hlc-navbar-logo"><img src="file://${join(dist.pathname,'hlc-logo-transparent.png')}" /></div><div class="hlc-navbar-brand-copy"><h2>HomeLead Connect</h2><span>HLC workspace</span></div></a><button class="hlc-navbar-toggle">Menu</button></nav><div class="hlc-route-content">
<section class="hlc-leads-workspace"><header class="hlc-leads-header"><div><p>WORK</p><h1>Leads</h1><p>Manage active opportunities.</p></div><button class="hlc-leads-add-button">Add lead</button></header><div class="hlc-leads-summary"><span><strong>3</strong><small>New</small></span><span><strong>1</strong><small>Due</small></span><span><strong>2</strong><small>Active</small></span><span><strong>0</strong><small>Overdue</small></span></div><div class="hlc-leads-list"><article class="hlc-lead-row" data-cert="lead"><div class="hlc-lead-identity"><div class="hlc-lead-avatar">AW</div><div class="hlc-lead-identity-copy"><strong>Representative Customer Name</strong><div class="hlc-lead-contact-line"><span>customer@example.com</span><span>(717) 555-0188</span></div><div class="hlc-lead-context"><span>Kitchen remodel</span><span>High priority</span></div></div></div><div class="hlc-lead-pipeline-cell"><strong>New</strong><small class="hlc-lead-sla">Due today</small></div><div class="hlc-lead-actions"><button>Open lead</button><button>Call</button><button>Follow up</button></div></article></div></section>
<div class="fixture-spacer"></div><section class="hlc-account-summary" data-cert="profile"><div><small>Workspace</small><strong>HomeLead Connect</strong></div><div><small>Language</small><strong>English</strong></div><div><small>Visibility</small><strong>Workspace members</strong></div><div><small>Role</small><strong>Owner</strong></div></section>
<div class="fixture-spacer"></div><form data-cert="controls"><label>Channel<select><option>Phone</option></select></label><label>Outcome<input placeholder="Enter outcome" /></label><label>Notes<textarea placeholder="Add notes"></textarea></label></form>
<div class="fixture-spacer"></div><section class="hlc-resources-workspace" data-cert="resources"><header class="hlc-resources-header"><div><p>RESOURCES</p><h1>Rules & Safety</h1><p>Operational guidance and safety standards.</p></div></header><div class="hlc-resources-summary"><div><strong>12</strong><small>Guides</small></div><div><strong>4</strong><small>Required</small></div><div><strong>2</strong><small>Updated</small></div></div><div class="hlc-resources-commandbar"><button>All</button><button>Safety</button><button>Privacy</button><button>Operations</button></div><div class="hlc-resources-ledger"><article class="hlc-resource-row"><span>1</span><div><strong>Protect customer information</strong><p>Keep private record details inside authorized HLC workspaces.</p></div></article></div></section>
<div class="fixture-spacer"></div><main class="hlc-legal-page" data-cert="legal"><div class="hlc-legal-shell"><header class="hlc-legal-brandbar"><img class="hlc-legal-logo" src="file://${join(dist.pathname,'hlc-logo-transparent.png')}"/><div class="hlc-legal-status-copy"><strong>Privacy Center</strong></div></header><section class="hlc-legal-hero"><div class="hlc-legal-hero-grid"><div><h1 class="hlc-legal-title">Privacy,<span>built into the experience.</span></h1><p class="hlc-legal-lead">Representative privacy summary.</p></div><aside class="hlc-legal-guide">Guide</aside></div></section><section class="hlc-legal-card"><h2>Information we collect</h2><p>Representative policy content for mobile geometry certification.</p></section><nav class="hlc-legal-nav"><a>Privacy</a><a>Terms</a><a>Platform disclosure</a></nav></div></main>
<div style="height:120px"></div><button data-cert="last-action">Last action</button></div>
<aside class="hlc-agent-dock" data-cert="agent"><button class="hlc-agent-dock-trigger"><img src="file://${join(dist.pathname,'brand/avatars/Dion_Locked_HLC.png')}"/><span>Dion</span></button></aside>
<nav class="hlc-mobile-tabbar" data-cert="tabbar"><a>Home</a><a>Work</a><a>Network</a><a>Community</a><button>More</button></nav></div></div></body></html>`;
const fixturePath = new URL('../artifacts/blind-visual/authenticated-fixture.html', import.meta.url);
await writeFile(fixturePath, fixtureHtml);

const launchOptions = { headless: true };
if (process.env.HLC_BROWSER_EXECUTABLE) launchOptions.executablePath = process.env.HLC_BROWSER_EXECUTABLE;
const browser = await chromium.launch(launchOptions);
const failures = [];
function fail(message) { failures.push(message); }
function within(value, min, max) { return value >= min && value <= max; }

async function certifyPage(page, label, screenshotName) {
  const geometry = await page.evaluate(() => ({ viewport: { width: innerWidth, height: innerHeight }, scrollWidth: document.documentElement.scrollWidth, bodyScrollWidth: document.body.scrollWidth }));
  if (geometry.scrollWidth > geometry.viewport.width + 1 || geometry.bodyScrollWidth > geometry.viewport.width + 1) fail(`${label}: horizontal overflow ${Math.max(geometry.scrollWidth, geometry.bodyScrollWidth)} > ${geometry.viewport.width}`);
  await page.screenshot({ path: new URL(`../artifacts/blind-visual/${screenshotName}`, import.meta.url).pathname, fullPage: true });
}

const iphone = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
await iphone.goto(`file://${fixturePath.pathname}`);
await iphone.waitForTimeout(100);
await certifyPage(iphone, 'authenticated iPhone fixture', 'authenticated-iphone.png');
const mobile = await iphone.evaluate(() => {
  const rect = (sel) => document.querySelector(sel)?.getBoundingClientRect();
  const style = (sel) => getComputedStyle(document.querySelector(sel));
  const lead = rect('[data-cert="lead"]');
  const leadCopy = rect('.hlc-lead-identity-copy');
  const profileCells = [...document.querySelectorAll('[data-cert="profile"] > *')].map((el) => el.getBoundingClientRect());
  const header = rect('.hlc-navbar');
  const agent = rect('.hlc-agent-dock-trigger');
  const agentStyle = style('.hlc-agent-dock-trigger');
  const tabbar = rect('[data-cert="tabbar"]');
  const last = rect('[data-cert="last-action"]');
  const inputStyle = style('[data-cert="controls"] input');
  const selectStyle = style('[data-cert="controls"] select');
  const textareaStyle = style('[data-cert="controls"] textarea');
  const resourceHeader = rect('.hlc-resources-header');
  const resourceBar = document.querySelector('.hlc-resources-commandbar');
  const legalGuide = style('.hlc-legal-guide');
  const legalCard = style('.hlc-legal-card');
  return { lead, leadCopy, profileCells, header, agent, agentRadius: agentStyle.borderRadius, tabbar, last, inputBg: inputStyle.backgroundColor, selectBg: selectStyle.backgroundColor, textareaBg: textareaStyle.backgroundColor, resourceHeader, resourceBar: { clientWidth: resourceBar.clientWidth, scrollWidth: resourceBar.scrollWidth }, legalGuideDisplay: legalGuide.display, legalCardRadius: legalCard.borderRadius };
});
if (!mobile.lead || mobile.lead.width < 350) fail(`Leads: record width too narrow (${mobile.lead?.width})`);
if (!mobile.leadCopy || mobile.leadCopy.width < 240) fail(`Leads: identity copy starved (${mobile.leadCopy?.width})`);
if (mobile.profileCells.some((cell) => cell.width < 150)) fail(`Profile: summary cell collapsed (${mobile.profileCells.map((x)=>Math.round(x.width)).join(',')})`);
if (!mobile.header || mobile.header.height > 76) fail(`Header: too tall (${mobile.header?.height})`);
if (!mobile.agent || !within(mobile.agent.width, 56, 64) || !within(mobile.agent.height, 56, 64)) fail(`Agent: launcher not compact circular size (${mobile.agent?.width}x${mobile.agent?.height})`);
if (!/50%/.test(mobile.agentRadius)) fail(`Agent: launcher border-radius is ${mobile.agentRadius}`);
for (const [name,bg] of [['input',mobile.inputBg],['select',mobile.selectBg],['textarea',mobile.textareaBg]]) if (/rgb\(255, 255, 255\)/.test(bg)) fail(`Controls: ${name} remained white`);
if (!mobile.tabbar || !mobile.last || mobile.last.bottom > mobile.tabbar.top - 8) fail(`Bottom nav: last action collides with tabbar`);
if (!mobile.resourceHeader || mobile.resourceHeader.height > 180) fail(`Resources: header still inflated (${mobile.resourceHeader?.height})`);
if (mobile.legalGuideDisplay !== 'none') fail(`Legal: mobile guide should be hidden, got ${mobile.legalGuideDisplay}`);
if (mobile.legalCardRadius !== '0px') fail(`Legal: card wall radius survived (${mobile.legalCardRadius})`);

const mac = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await mac.goto(`file://${fixturePath.pathname}`);
await mac.waitForTimeout(100);
await certifyPage(mac, 'authenticated Mac fixture', 'authenticated-mac.png');

for (const route of ['/', '/login', '/privacy', '/terms', '/platform-disclosure']) {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true });
  await page.goto(`http://127.0.0.1:4173${route}`, { waitUntil: 'networkidle' });
  await certifyPage(page, `public iPhone ${route}`, `public-iphone-${route === '/' ? 'home' : route.slice(1).replaceAll('/','-')}.png`);
  await page.close();
}
for (const route of ['/', '/login', '/privacy']) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`http://127.0.0.1:4173${route}`, { waitUntil: 'networkidle' });
  await certifyPage(page, `public Mac ${route}`, `public-mac-${route === '/' ? 'home' : route.slice(1)}.png`);
  await page.close();
}

await browser.close();
if (failures.length) { console.error('Blind visual certification FAILED:\n- ' + failures.join('\n- ')); process.exit(1); }
console.log('Blind visual certification PASS: iPhone + Mac geometry, controls, agent, nav, resources/legal, and public routes.');
