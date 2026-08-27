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
const logoPath = join(dist.pathname, 'hlc-logo-transparent.png');
const avatarPath = join(dist.pathname, 'brand/avatars/Dion_Locked_HLC.png');

const certScript = String.raw`
(() => {
  const failures = [];
  const fail = (message) => failures.push(message);
  const rect = (sel) => document.querySelector(sel)?.getBoundingClientRect();
  const style = (sel) => getComputedStyle(document.querySelector(sel));
  const within = (value, min, max) => value >= min && value <= max;
  const root = document.documentElement;
  if (root.scrollWidth > innerWidth + 1 || document.body.scrollWidth > innerWidth + 1) fail('horizontal-overflow:' + Math.max(root.scrollWidth, document.body.scrollWidth) + '>' + innerWidth);
  if (innerWidth <= 720) {
    const lead = rect('[data-cert="lead"]');
    const leadCopy = rect('.hlc-lead-identity-copy');
    const profileCells = [...document.querySelectorAll('[data-cert="profile"] > *')].map((el) => el.getBoundingClientRect());
    const header = rect('.hlc-navbar');
    const agent = rect('.hlc-agent-dock-trigger');
    const tabbar = rect('[data-cert="tabbar"]');
    const routeContent = document.querySelector('.hlc-route-content');
    const inputBg = style('[data-cert="controls"] input').backgroundColor;
    const selectBg = style('[data-cert="controls"] select').backgroundColor;
    const textareaBg = style('[data-cert="controls"] textarea').backgroundColor;
    const resourceHeader = rect('.hlc-resources-header');
    const legalGuide = style('.hlc-legal-guide');
    const legalCard = style('.hlc-legal-card');
    if (!lead || lead.width < innerWidth - 45) fail('lead-width:' + (lead?.width ?? 0));
    if (!leadCopy || leadCopy.width < 240) fail('lead-copy-starved:' + (leadCopy?.width ?? 0));
    if (profileCells.some((cell) => cell.width < 150)) fail('profile-cells:' + profileCells.map((x) => Math.round(x.width)).join(','));
    if (!header || header.height > 76) fail('header-height:' + (header?.height ?? 0));
    if (!agent || !within(agent.width, 56, 64) || !within(agent.height, 56, 64)) fail('agent-size:' + (agent?.width ?? 0) + 'x' + (agent?.height ?? 0));
    if (!/50%/.test(style('.hlc-agent-dock-trigger').borderRadius)) fail('agent-radius:' + style('.hlc-agent-dock-trigger').borderRadius);
    for (const [name,bg] of [['input',inputBg],['select',selectBg],['textarea',textareaBg]]) if (bg === 'rgb(255, 255, 255)') fail('white-control:' + name);
    if (!tabbar) fail('tabbar-missing');
    const padBottom = parseFloat(getComputedStyle(routeContent).paddingBottom || '0');
    if (tabbar && padBottom < tabbar.height + 24) fail('bottom-reservation:' + padBottom + '<' + (tabbar.height + 24));
    if (!resourceHeader || resourceHeader.height > 180) fail('resource-header-height:' + (resourceHeader?.height ?? 0));
    if (legalGuide.display !== 'none') fail('legal-guide-display:' + legalGuide.display);
    if (legalCard.borderRadius !== '0px') fail('legal-card-radius:' + legalCard.borderRadius);
  }
  document.body.dataset.certStatus = failures.length ? 'fail' : 'pass';
  document.body.dataset.certFailures = failures.join('|');
  const result = document.createElement('pre');
  result.id = 'hlc-blind-cert-result';
  result.textContent = failures.length ? 'FAIL\\n' + failures.join('\\n') : 'PASS';
  document.body.appendChild(result);
})();`;

const fixtureHtml = `<!doctype html><html><head><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><style>${authCss}</style><style>html,body{margin:0} body{background:#071426;color:#f8fbff}.fixture-spacer{height:32px}#hlc-blind-cert-result{position:fixed;left:4px;top:4px;z-index:99999;font:10px monospace;opacity:.25}</style></head><body><div id="root"><div class="hlc-app-shell hlc-signed-in-shell hlc-page-leads"><nav class="hlc-navbar"><a class="hlc-navbar-brand"><div class="hlc-navbar-logo"><img src="file://${logoPath}" /></div><div class="hlc-navbar-brand-copy"><h2>HomeLead Connect</h2><span>HLC workspace</span></div></a><button class="hlc-navbar-toggle">Menu</button></nav><div class="hlc-route-content">
<section class="hlc-leads-workspace"><header class="hlc-leads-header"><div><p>WORK</p><h1>Leads</h1><p>Manage active opportunities.</p></div><button class="hlc-leads-add-button">Add lead</button></header><div class="hlc-leads-summary"><span><strong>3</strong><small>New</small></span><span><strong>1</strong><small>Due</small></span><span><strong>2</strong><small>Active</small></span><span><strong>0</strong><small>Overdue</small></span></div><div class="hlc-leads-list"><article class="hlc-lead-row" data-cert="lead"><div class="hlc-lead-identity"><div class="hlc-lead-avatar">AW</div><div class="hlc-lead-identity-copy"><strong>Representative Customer Name</strong><div class="hlc-lead-contact-line"><span>customer@example.com</span><span>(717) 555-0188</span></div><div class="hlc-lead-context"><span>Kitchen remodel</span><span>High priority</span></div></div></div><div class="hlc-lead-pipeline-cell"><strong>New</strong><small class="hlc-lead-sla">Due today</small></div><div class="hlc-lead-actions"><button>Open lead</button><button>Call</button><button>Follow up</button></div></article></div></section>
<div class="fixture-spacer"></div><section class="hlc-account-summary" data-cert="profile"><div><small>Workspace</small><strong>HomeLead Connect</strong></div><div><small>Language</small><strong>English</strong></div><div><small>Visibility</small><strong>Workspace members</strong></div><div><small>Role</small><strong>Owner</strong></div></section>
<div class="fixture-spacer"></div><form data-cert="controls"><label>Channel<select><option>Phone</option></select></label><label>Outcome<input placeholder="Enter outcome" /></label><label>Notes<textarea placeholder="Add notes"></textarea></label></form>
<div class="fixture-spacer"></div><section class="hlc-resources-workspace" data-cert="resources"><header class="hlc-resources-header"><div><p>RESOURCES</p><h1>Rules & Safety</h1><p>Operational guidance and safety standards.</p></div></header><div class="hlc-resources-summary"><div><strong>12</strong><small>Guides</small></div><div><strong>4</strong><small>Required</small></div><div><strong>2</strong><small>Updated</small></div></div><div class="hlc-resources-commandbar"><button>All</button><button>Safety</button><button>Privacy</button><button>Operations</button></div><div class="hlc-resources-ledger"><article class="hlc-resource-row"><span>1</span><div><strong>Protect customer information</strong><p>Keep private record details inside authorized HLC workspaces.</p></div></article></div></section>
<div class="fixture-spacer"></div><main class="hlc-legal-page" data-cert="legal"><div class="hlc-legal-shell"><header class="hlc-legal-brandbar"><img class="hlc-legal-logo" src="file://${logoPath}"/><div class="hlc-legal-status-copy"><strong>Privacy Center</strong></div></header><section class="hlc-legal-hero"><div class="hlc-legal-hero-grid"><div><h1 class="hlc-legal-title">Privacy,<span>built into the experience.</span></h1><p class="hlc-legal-lead">Representative privacy summary.</p></div><aside class="hlc-legal-guide">Guide</aside></div></section><section class="hlc-legal-card"><h2>Information we collect</h2><p>Representative policy content for mobile geometry certification.</p></section><nav class="hlc-legal-nav"><a>Privacy</a><a>Terms</a><a>Platform disclosure</a></nav></div></main>
<div style="height:120px"></div><button data-cert="last-action">Last action</button></div><aside class="hlc-agent-dock" data-cert="agent"><button class="hlc-agent-dock-trigger"><img src="file://${avatarPath}"/><span>Dion</span></button></aside><nav class="hlc-mobile-tabbar" data-cert="tabbar"><a>Home</a><a>Work</a><a>Network</a><a>Community</a><button>More</button></nav></div></div><script>${certScript}</script></body></html>`;

await writeFile(new URL('../artifacts/blind-visual/authenticated-fixture.html', import.meta.url), fixtureHtml);
console.log('Blind visual fixture generated.');
