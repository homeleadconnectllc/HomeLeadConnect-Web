import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {chromium,webkit} from 'playwright';
const sha=process.env.MENU_SOURCE || execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),engineName=process.env.MENU_ENGINE || 'chromium',base=process.env.MENU_BASE_URL || 'http://127.0.0.1:4173';
assert.equal(new URL(base).hostname,'127.0.0.1','only isolated loopback static evidence is allowed');
assert.equal(execFileSync('git',['rev-parse','HEAD'],{encoding:'utf8'}).trim(),sha);
const output='artifacts/menu-'+engineName+'-'+sha;fs.mkdirSync(output,{recursive:true});
const report={source:sha,tree:execFileSync('git',['rev-parse','HEAD^{tree}'],{encoding:'utf8'}).trim(),engine:engineName,cases:[],blocked:[],allowedWrites:[]};
const paths=['/about','/homeowners','/professionals','/partners','/community','/services','/login','/register'];
const labels=['About','For Residents','For Professionals','For Partners','Community','Resources','Sign In','Get Started'];
const routes=['/','/login','/register','/about','/homeowners','/professionals','/partners','/community','/services'];
const viewports=[{width:320,height:844},{width:390,height:844},{width:680,height:844},{width:768,height:844},{width:1050,height:844},{width:1051,height:844},{width:1440,height:1000},{width:844,height:390}];
const rgb=c=>(c.match(/[\d.]+/g)||[]).slice(0,3).map(Number);
const lum=c=>rgb(c).map(n=>n/255).map(n=>n<=.04045?n/12.92:((n+.055)/1.055)**2.4).reduce((s,n,i)=>s+n*[.2126,.7152,.0722][i],0);
const contrast=(a,b)=>(Math.max(lum(a),lum(b))+.05)/(Math.min(lum(a),lum(b))+.05);
const browser=await {chromium,webkit}[engineName].launch({headless:true});report.version=browser.version();
try{
for(const viewport of viewports){
const context=await browser.newContext({viewport,serviceWorkers:'block'});
await context.route('**/*',route=>{
const req=route.request(),u=new URL(req.url()),denied=u.origin!==base||req.method()!=='GET'||['xhr','fetch'].includes(req.resourceType())||/^\/(api|rest|auth|functions)\//.test(u.pathname);
if(denied){report.blocked.push({method:req.method(),url:req.url(),type:req.resourceType()});return route.abort('blockedbyclient');}
if(req.method()!=='GET'||u.origin!==base)report.allowedWrites.push({method:req.method(),url:req.url()});
return route.continue();
});
await context.routeWebSocket('**/*',ws=>{report.blocked.push({type:'websocket',url:ws.url()});ws.close();});
for(const route of routes){
const page=await context.newPage(),slug=route==='/'?'home':route.slice(1);
const item={route,viewport,failures:[],checks:[],errors:[]};report.cases.push(item);
const check=(name,ok,detail=null)=>{item.checks.push({name,pass:!!ok,detail});if(!ok)item.failures.push(name);};
page.on('pageerror',e=>item.errors.push(e.message));
try{
await page.goto(base+route,{waitUntil:'networkidle',timeout:20000});
const header=page.locator('header.hlc-board-nav');
await header.waitFor({state:'visible',timeout:5000});
check('single-header',await header.count()===1);
const trigger=header.locator('summary');
const focusPaint=locator=>locator.evaluate(e=>{const s=getComputedStyle(e);return {active:document.activeElement===e,style:s.outlineStyle,width:s.outlineWidth,background:s.backgroundColor};});
const unfocusedTrigger=await focusPaint(trigger);
const firstLink=header.locator('nav[aria-label="Mobile navigation"] a').first();
if(viewport.width<=(route==='/'?680:1050)){
await trigger.click();
const unfocusedLink=await focusPaint(firstLink);
item.state=await trigger.evaluate(summary=>{
const details=summary.parentElement,panel=details.querySelector('nav'),s=getComputedStyle;
const box=e=>{const r=e.getBoundingClientRect();return {x:r.x,y:r.y,width:r.width,height:r.height,right:r.right,bottom:r.bottom};};
return {open:details.open,wrapper:{border:s(details).borderTopWidth,shadow:s(details).boxShadow},trigger:{...box(summary),border:s(summary).borderTopWidth,shadow:s(summary).boxShadow,background:s(summary).backgroundColor},
panel:{...box(panel),background:s(panel).backgroundColor,overflowY:s(panel).overflowY,clientHeight:panel.clientHeight,scrollHeight:panel.scrollHeight},
header:box(summary.closest('header')),
links:[...panel.querySelectorAll('a')].map(a=>{
const span=a.querySelector('span[class*="__label"]')||[...a.querySelectorAll(':scope > span')].find(e=>!e.querySelector('svg'));
const svg=a.querySelector('svg');
return {href:a.href,path:new URL(a.href).pathname,label:span.textContent.trim(),...box(a),background:s(a).backgroundColor,color:s(a).color,labelColor:s(span).color,labelFill:s(span).webkitTextFillColor,labelOpacity:s(span).opacity,labelBox:box(span),
icon:{...box(svg),color:s(svg).color,stroke:s(svg).stroke,opacity:s(svg).opacity,paint:[...svg.querySelectorAll('path,circle,line,polyline,rect')].map(p=>({stroke:s(p).stroke,fill:s(p).fill,opacity:s(p).opacity,strokeOpacity:s(p).strokeOpacity,strokeWidth:s(p).strokeWidth}))}};
})};
});
const st=item.state;
check('menu-open',st.open);
check('no-wrapper-border',st.wrapper.border==='0px');
check('no-trigger-pill',st.trigger.border==='0px'&&st.trigger.shadow==='none'&&st.trigger.background==='rgba(0, 0, 0, 0)');
check('trigger-touch-target',st.trigger.width>=44&&st.trigger.height>=44);
check('dropdown-inside-viewport',st.panel.x>=-.5&&st.panel.right<=viewport.width+.5,{x:st.panel.x,right:st.panel.right,width:viewport.width});
check('header-inside-viewport',st.header.x>=-.5&&st.header.right<=viewport.width+.5);
check('unchanged-link-paths',JSON.stringify(st.links.map(a=>a.path))===JSON.stringify(paths));
check('unchanged-labels',JSON.stringify(st.links.map(a=>a.label))===JSON.stringify(labels));
for(const a of st.links){
const bg=a.background==='rgba(0, 0, 0, 0)'?st.panel.background:a.background;
a.textContrast=contrast(a.labelFill||a.labelColor,bg);
a.iconContrast=a.icon.paint.filter(p=>p.stroke!=='none'&&rgb(p.stroke).length===3).map(p=>contrast(p.stroke,bg));
check('text-readable:'+a.path,a.textContrast>=4.5&&a.labelOpacity==='1',{contrast:a.textContrast,fill:a.labelFill});
check('icon-readable:'+a.path,a.iconContrast.length>0&&Math.min(...a.iconContrast)>=3&&a.icon.opacity==='1',{contrast:a.iconContrast,paint:a.icon.paint});
check('label-fits:'+a.path,a.labelBox.x>=a.x-.5&&a.labelBox.right<=a.right+.5);
check('link-touch-target:'+a.path,a.height>=43);
check('authorized-destination:'+a.path,[new URL(base).hostname,'app.homeleadconnect.org'].includes(new URL(a.href).hostname));
}
item.screenshot=output+'/'+slug+'-'+viewport.width+'x'+viewport.height+'-open.png';
await page.screenshot({path:item.screenshot});
await trigger.click();check('click-closes',!(await trigger.evaluate(e=>e.parentElement.open)));
await trigger.press('Enter');check('enter-opens',await trigger.evaluate(e=>e.parentElement.open));
item.triggerFocus=await focusPaint(trigger);
check('trigger-keyboard-focus-visible',item.triggerFocus.active&&((item.triggerFocus.style!=='none'&&item.triggerFocus.width!=='0px')||item.triggerFocus.background!==unfocusedTrigger.background));
await trigger.press('Space');check('space-closes',!(await trigger.evaluate(e=>e.parentElement.open)));
await trigger.press('Space');check('space-opens',await trigger.evaluate(e=>e.parentElement.open));
await trigger.press('Tab');
const focusedPath=()=>page.evaluate(()=>document.activeElement?.href?new URL(document.activeElement.href).pathname:null);
item.tabOrder=[];
for(let i=0;i<paths.length;i++){
const focus=await focusedPath();item.tabOrder.push(focus);
check('tab-order:'+i,focus===paths[i]);
await page.keyboard.press('Tab');
}
await firstLink.press('Shift+Tab');
await trigger.press('Tab');
item.linkFocus=await focusPaint(firstLink);
check('link-keyboard-focus-visible',item.linkFocus.active&&((item.linkFocus.style!=='none'&&item.linkFocus.width!=='0px')||item.linkFocus.background!==unfocusedLink.background));
await firstLink.press('Enter');
await page.waitForURL(u=>u.pathname==='/about',{timeout:10000});
check('keyboard-link-navigation',new URL(page.url()).origin===base&&new URL(page.url()).pathname==='/about');
}else{
check('desktop-hides-mobile-trigger',!(await trigger.isVisible()));
if(route==='/'&&viewport.width<=1050){
item.knownBaselineLimitation='Homepage navigation gap above 680 through 1050 is present in protected production; outside this menu repair.';
check('baseline-home-breakpoint-unchanged',!(await header.locator('.hlc-board-links').isVisible()));
}else check('desktop-shows-primary-navigation',await header.locator('.hlc-board-links').isVisible());
item.screenshot=output+'/'+slug+'-'+viewport.width+'x'+viewport.height+'-desktop.png';await page.screenshot({path:item.screenshot});
}
check('header-responsive-width',await header.evaluate(e=>{const r=e.getBoundingClientRect();return r.x>=-.5&&r.right<=innerWidth+.5;}));
check('no-browser-runtime-errors',item.errors.length===0,item.errors);
}catch(e){item.failures.push('test-exception');item.exception=e.message;await page.screenshot({path:output+'/'+slug+'-'+viewport.width+'x'+viewport.height+'-exception.png'}).catch(()=>{});}
finally{
console.log(JSON.stringify({source:sha,engine:engineName,route,viewport,failures:item.failures,geometry:item.state?{x:item.state.panel.x,right:item.state.panel.right}:null}));
await page.close();
}
}
await context.close();
}
}finally{
await browser.close();report.allowedNonlocalOrWriteRequests=report.allowedWrites.length;
report.summary={passedCases:report.cases.filter(c=>!c.failures.length).length,totalCases:report.cases.length,failedChecks:report.cases.reduce((n,c)=>n+c.failures.length,0)};
fs.writeFileSync(output+'/report.json',JSON.stringify(report,null,2));
console.log('DIAGNOSTIC_SUMMARY '+JSON.stringify({source:sha,tree:report.tree,engine:engineName,...report.summary,allowedNonlocalOrWriteRequests:report.allowedNonlocalOrWriteRequests,blocked:report.blocked.length}));
}
if(report.summary.failedChecks)process.exitCode=1;
