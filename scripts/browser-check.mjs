import { chromium } from 'playwright';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const origin=process.env.GSTPIXEL_URL||'http://127.0.0.1:3000';
const expanded=process.argv.includes('--expanded');
const routes=['/','/services/gst','/tools','/tools/gst-calculator',...(expanded?['/services','/services/fssai','/services/web-development','/services/app-development','/services/digital-marketing','/services/business-support','/start-business']:[])];
const report={date:new Date().toISOString(),origin,routes:[],interactions:[],errors:[]};
await mkdir('review',{recursive:true});
const browser=await chromium.launch({headless:true});
try {
 const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
 const page=await context.newPage();page.on('pageerror',error=>report.errors.push(error.message));
 for(const route of routes){
  const response=await page.goto(origin+route);assert.equal(response.status(),200,`${route} HTTP status`);
  await page.getByRole('main').waitFor();await page.evaluate(()=>document.fonts.ready);
  assert.equal(await page.locator('main h1').count(),1,`${route} h1`);
  const sizes=[];
  for(const width of [320,390,768,1440]){
   await page.setViewportSize({width,height:1000});
   const sizing=await page.evaluate(()=>({width:innerWidth,client:document.documentElement.clientWidth,scroll:document.documentElement.scrollWidth}));
   sizes.push(sizing);assert.equal(sizing.width,width);assert.ok(sizing.scroll<=sizing.client,`${route} overflow at ${width}: ${sizing.scroll} > ${sizing.client}`);
   if(width===390&&['/','/tools/gst-calculator','/start-business'].includes(route))await page.screenshot({path:`review/${route==='/'?'homepage':route.split('/').at(-1)}-mobile.png`,fullPage:true});
  }
  await page.addScriptTag({path:require.resolve('axe-core/axe.min.js')});
  const audit=await page.evaluate(async()=>{const r=await window.axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa']}});return {passes:r.passes.length,violations:r.violations.map(v=>({id:v.id,impact:v.impact,description:v.description,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary})).slice(0,12)})),incomplete:r.incomplete.map(v=>v.id)}});
  report.routes.push({route,sizes,audit});console.log(`Checked ${route}: four widths, ${audit.violations.length} accessibility violations`);
  if(route==='/'){await page.screenshot({path:'review/homepage-desktop.png',fullPage:true});await page.screenshot({path:'review/homepage-hero-desktop.png'});await page.locator('#pathways').screenshot({path:'review/homepage-pathway-desktop.png'});}
 }
 await page.goto(origin+'/tools/gst-calculator');
 await page.getByLabel('Amount before GST',{exact:true}).fill('1000');
 await page.getByRole('button',{name:'Calculate GST',exact:true}).click();
 assert.equal(await page.getByTestId('gst-total').innerText(),'₹1,180.00');
 assert.equal(await page.getByTestId('cgst').innerText(),'₹90.00');
 await page.getByRole('radio',{name:'Remove GST Amount includes tax'}).check();
 await page.getByLabel('Amount including GST',{exact:true}).fill('1180');
 await page.getByRole('radio',{name:'IGST Single tax representation'}).check();
 await page.getByRole('button',{name:'Calculate GST',exact:true}).click();
 assert.equal(await page.getByTestId('gst-base').innerText(),'₹1,000.00');
 assert.equal(await page.getByTestId('igst').innerText(),'₹180.00');
 await page.getByLabel('GST percentage',{exact:true}).fill('101');
 await page.getByRole('button',{name:'Calculate GST',exact:true}).click();
 assert.equal(await page.locator('#rate').getAttribute('aria-invalid'),'true');
 assert.equal(await page.evaluate(()=>document.activeElement.id),'rate');
 await page.getByRole('button',{name:'Reset',exact:true}).click();
 assert.equal(await page.locator('#amount').inputValue(),'');assert.equal(await page.getByTestId('gst-total').count(),0);
 await page.locator('#amount').fill('1000');await page.locator('#rate').fill('18');await page.locator('#rate').press('Enter');
 assert.equal(await page.getByTestId('gst-total').innerText(),'₹1,180.00');
 report.interactions.push('GST exclusive/inclusive/split/IGST/invalid-rate/reset/keyboard submit passed');
 await page.goto(origin+'/tools');await page.getByRole('button',{name:'Digital',exact:true}).click();
 assert.equal(await page.getByRole('heading',{name:'GST Calculator',exact:true}).count(),0);
 await page.getByRole('searchbox',{name:'Search tools'}).fill('zzzz');await page.getByRole('heading',{name:'No tools match your search.'}).waitFor();
 await page.getByRole('button',{name:'Clear filters'}).click();await page.getByRole('link',{name:/GST Calculator/}).waitFor();
 report.interactions.push('Tools categories/search/empty state/reset passed');
 await page.setViewportSize({width:390,height:844});await page.goto(origin+'/');
 const menu=page.getByRole('button',{name:'Menu',exact:true});await menu.click();assert.equal(await page.getByRole('button',{name:'Close',exact:true}).getAttribute('aria-expanded'),'true');
 await page.keyboard.press('Escape');assert.equal(await menu.getAttribute('aria-expanded'),'false');assert.equal(await menu.evaluate(el=>document.activeElement===el),true);
 await menu.click();await page.getByRole('navigation',{name:'Main navigation'}).getByRole('link',{name:'Tools',exact:true}).click();await page.waitForURL(origin+'/tools');assert.equal(await menu.getAttribute('aria-expanded'),'false');
 report.interactions.push('Mobile menu open/close/Escape/focus return/route close passed');
 await page.goto(origin+'/');await page.getByRole('button',{name:'Get consultation',exact:true}).last().click();
 const dialog=page.getByRole('dialog');await dialog.waitFor();assert.equal(await page.evaluate(()=>document.activeElement.getAttribute('aria-label')),'Close consultation details');
 await page.keyboard.press('Shift+Tab');assert.equal(await dialog.evaluate(el=>el.contains(document.activeElement)),true);
 await page.keyboard.press('Tab');assert.equal(await dialog.evaluate(el=>el.contains(document.activeElement)),true);
 await page.keyboard.press('Escape');assert.equal(await dialog.count(),0);
 report.interactions.push('Native consultation dialog focus/trap/Escape passed');
 await page.getByRole('button',{name:'Mobile',exact:true}).click();assert.equal(await page.getByRole('button',{name:'Mobile',exact:true}).getAttribute('aria-pressed'),'true');
 await page.getByRole('button',{name:'Desktop',exact:true}).click();
 await page.locator('summary').filter({hasText:'What can GSTPIXEL help me with?'}).click();assert.equal(await page.locator('details').first().getAttribute('open'),'');
 report.interactions.push('Studio concept switch and FAQ disclosure passed');
 const motion=await page.evaluate(()=>[...document.querySelectorAll('main *')].filter(e=>getComputedStyle(e).animationName!=='none').length);assert.equal(motion,0);
 report.interactions.push('System reduced-motion disables nonessential CSS animation');
 await context.close();
} catch(error){report.errors.push(error.stack||String(error));process.exitCode=1;}
finally {await browser.close();await writeFile('review/browser-report.json',JSON.stringify(report,null,2));}
const violations=report.routes.flatMap(r=>r.audit.violations.map(v=>({route:r.route,...v})));
console.log(JSON.stringify({routes:report.routes.length,viewportChecks:report.routes.reduce((n,r)=>n+r.sizes.length,0),interactions:report.interactions,violations,errors:report.errors},null,2));
if(violations.length||report.errors.length)process.exitCode=1;
