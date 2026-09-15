import { chromium } from 'playwright';
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);
const origin=process.env.GSTPIXEL_URL||'http://127.0.0.1:3000';
const expanded=process.argv.includes('--expanded');
const routes=['/','/services/gst','/tools','/tools/gst-calculator',...(expanded?[
 '/services',
 '/services/gst-registration',
 '/services/gst-return-filing',
 '/services/fssai',
 '/services/trade-license',
 '/services/udyam-msme',
 '/services/proprietorship-registration',
 '/services/partnership-registration',
 '/services/llp-registration',
 '/services/company-registration',
 '/services/business-support',
 '/services/web-development',
 '/services/app-development',
 '/services/digital-marketing',
 '/start-business',
 '/digital-studio',
 '/about',
 '/contact',
 '/tools/profit-margin',
 '/tools/break-even',
]:[])];
const report={date:new Date().toISOString(),origin,routes:[],interactions:[],errors:[]};

async function checkProgressiveWorkflow(page,{route,storageKey,label}) {
 await page.goto(origin+route);
 await page.evaluate((key)=>localStorage.removeItem(key),storageKey);
 await page.reload();
 const workspace=page.locator('section[aria-labelledby="workflow-title"]');
 await workspace.waitFor();
 const prompt=workspace.locator('.questionPane h3, [class*="questionPane"] h3').first();
 const firstPrompt=await prompt.innerText();
 await workspace.getByRole('group').getByRole('button').first().click();
 const secondPrompt=await prompt.innerText();
 assert.notEqual(secondPrompt,firstPrompt,`${label} advances one question at a time`);
 const back=workspace.getByRole('button',{name:'Previous question',exact:false});
 await back.click();
 assert.equal(await prompt.innerText(),firstPrompt,`${label} Back returns to the previous question`);
 await workspace.getByRole('group').getByRole('button').first().click();
 assert.ok(await page.evaluate((key)=>localStorage.getItem(key)!==null,storageKey),`${label} uses ${storageKey}`);
 await page.reload();
 await workspace.waitFor();
 await workspace.getByRole('heading',{name:secondPrompt,exact:true}).waitFor();
 assert.equal(await prompt.innerText(),secondPrompt,`${label} resumes after reload`);

 for(let step=0;step<12&&await workspace.locator('#brief-summary-title').count()===0;step+=1){
  const options=workspace.getByRole('group').getByRole('button');
  if(await options.count()) await options.first().click();
  else await workspace.getByRole('button',{name:'I have the details ready',exact:true}).click();
 }
 await workspace.locator('#brief-summary-title').waitFor();
 await workspace.getByRole('button',{name:'Request professional review',exact:true}).waitFor();
 assert.ok(await page.evaluate((key)=>localStorage.getItem(key)!==null,storageKey),`${label} completed brief stays under its dedicated key`);
 await workspace.getByRole('button',{name:'Start a new brief',exact:true}).click();
 assert.equal(await page.evaluate((key)=>localStorage.getItem(key),storageKey),null,`${label} reset clears its dedicated key`);
 await workspace.getByRole('heading',{name:firstPrompt,exact:true}).waitFor();
 report.interactions.push(`${label} progression/Back/local resume/completion/dedicated storage/reset/professional-review CTA passed`);
}
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
 await page.goto(origin+'/tools/profit-margin');
 await page.getByLabel('Revenue',{exact:true}).fill('1000');
 await page.getByLabel('Total costs',{exact:true}).fill('600');
 await page.getByRole('button',{name:'Calculate result',exact:false}).click();
 assert.equal(await page.getByTestId('profit-result').innerText(),'₹400.00');
 assert.equal(await page.getByTestId('margin-result').innerText(),'40.00%');
 assert.equal(await page.getByTestId('markup-result').innerText(),'66.67%');
 report.interactions.push('Profit/margin/markup calculation and rounding passed');
 await page.goto(origin+'/tools/break-even');
 await page.getByLabel('Fixed costs',{exact:true}).fill('10000');
 await page.getByLabel('Selling price per unit',{exact:true}).fill('500');
 await page.getByLabel('Variable cost per unit',{exact:true}).fill('300');
 await page.getByRole('button',{name:'Calculate break-even',exact:false}).click();
 assert.equal(await page.getByTestId('break-even-result').innerText(),'50 units');
 assert.equal(await page.getByTestId('contribution-result').innerText(),'₹200.00');
 report.interactions.push('Break-even whole-unit and contribution calculation passed');
 await page.goto(origin+'/tools');await page.getByRole('button',{name:'Digital',exact:true}).click();
 assert.equal(await page.getByRole('heading',{name:'GST Calculator',exact:true}).count(),0);
 await page.getByRole('searchbox',{name:'Search tools'}).fill('zzzz');await page.getByRole('heading',{name:'No tools match your search.'}).waitFor();
 await page.getByRole('button',{name:'Clear filters'}).click();await page.getByRole('link',{name:/GST Calculator/}).waitFor();
 await page.getByRole('link',{name:/Profit & Margin Calculator/}).waitFor();
 await page.getByRole('link',{name:/Break-even Calculator/}).waitFor();
 report.interactions.push('Tools categories/search/empty state/reset passed');
 await checkProgressiveWorkflow(page,{route:'/services/gst',storageKey:'gstpixel-gst-registration-brief-v1',label:'GST registration workflow'});
 await checkProgressiveWorkflow(page,{route:'/services/gst-return-filing',storageKey:'gstpixel-gst-return-filing-brief-v1',label:'GST return filing workflow'});
 await checkProgressiveWorkflow(page,{route:'/services/fssai',storageKey:'gstpixel-fssai-brief-v1',label:'FSSAI workflow'});
 await checkProgressiveWorkflow(page,{route:'/services/trade-license',storageKey:'gstpixel-trade-license-brief-v1',label:'Trade licence workflow'});
 await checkProgressiveWorkflow(page,{route:'/services/udyam-msme',storageKey:'gstpixel-udyam-msme-brief-v1',label:'Udyam/MSME workflow'});
 await checkProgressiveWorkflow(page,{route:'/services/proprietorship-registration',storageKey:'gstpixel-proprietorship-brief-v1',label:'Proprietorship workflow'});
 await checkProgressiveWorkflow(page,{route:'/services/partnership-registration',storageKey:'gstpixel-partnership-brief-v1',label:'Partnership workflow'});
 await checkProgressiveWorkflow(page,{route:'/services/llp-registration',storageKey:'gstpixel-llp-registration-brief-v1',label:'LLP workflow'});
 await checkProgressiveWorkflow(page,{route:'/services/company-registration',storageKey:'gstpixel-company-registration-brief-v1',label:'Company registration workflow'});
 await checkProgressiveWorkflow(page,{route:'/services/business-support',storageKey:'gstpixel-business-support-brief-v1',label:'Business support workflow'});
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
