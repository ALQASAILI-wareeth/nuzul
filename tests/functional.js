const p=require(process.env.PUPPETEER || 'puppeteer-core');
const B=process.env.BASE || 'http://localhost:8765';const out=[];const ok=(n,c,x)=>out.push((c?'PASS ':'FAIL ')+n+(x?' :: '+x:''));
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
(async()=>{const b=await p.launch({executablePath:process.env.CHROME || '/usr/bin/google-chrome',args:['--no-sandbox']});
async function page(mode,vw){const pg=await b.newPage();pg._errs=[];pg._404=[];pg.on('pageerror',e=>pg._errs.push(e.message));pg.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|ERR_FAILED|net::/.test(m.text()))pg._errs.push('console: '+m.text())});
 pg.on('response',r=>{if(r.status()>=400&&r.url().startsWith(B))pg._404.push(r.status()+' '+r.url().replace(B,''))});
 await pg.setViewport(vw||{width:390,height:844,isMobile:true,hasTouch:true});await pg.setRequestInterception(true);
 const H={'access-control-allow-origin':'*','content-type':'application/json'};const loc=['cairo','paris','rome','tokyo','bali','london','vienna'];
 pg.on('request',async r=>{const u=r.url();
  if(/wikipedia\.org\/w\/api\.php/.test(u)){
   if(mode==='fail') return r.abort();
   if(mode==='bad') return r.respond({status:200,headers:H,body:'<html>oops'});
   if(mode==='slow') await sleep(1500);
   if(u.includes('generator=images')){const pages={};if(mode!=='none')loc.forEach((c,i)=>pages[i+1]={title:'File:'+c+' view.jpg',imagerepository:'shared',imageinfo:[{thumburl:B+'/img/cities/'+c+'.webp',width:2000,height:1300,mime:'image/jpeg',extmetadata:{Artist:{value:'A'+i},LicenseShortName:{value:'CC BY 4.0'}}}]});return r.respond({status:200,headers:H,body:JSON.stringify({query:{pages}})});}
   const t=decodeURIComponent(new URL(u).searchParams.get('titles')).split('|');const pages={};
   t.forEach((x,i)=>{ if(mode==='lead'||mode==='slow') pages[i+1]={title:x,pageimage:'Photo_'+i+'.jpg',thumbnail:{source:B+'/img/cities/rome.webp'}};
     else if(mode==='flag') pages[i+1]=/السياحة|Tourism/.test(x)?{title:x,pageimage:'Taj.jpg',thumbnail:{source:B+'/img/cities/cairo.webp'}}:{title:x,pageimage:'Flag_of_X.svg',thumbnail:{source:'x'}};
     else if(mode==='brokenimg') pages[i+1]={title:x,pageimage:'Broken_'+i+'.jpg',thumbnail:{source:B+'/img/nope.jpg'}};
     else pages[-i-1]={title:x,missing:''}; });
   return r.respond({status:200,headers:H,body:JSON.stringify({query:{pages}})});}
  if(/commons\.wikimedia\.org\/w\/api/.test(u)){ if(mode==='fail')return r.abort(); return r.respond({status:200,headers:H,body:JSON.stringify({query:{pages:{}}})});}
  if(/wikipedia|wikimedia|cloudflareinsights/.test(u)) return r.abort(); r.continue();});
 return pg;}
const st=pg=>pg.evaluate(()=>({cards:document.querySelectorAll('.hc').length,shown:document.querySelectorAll('.hc .hi:not(.noimg) img').length,broken:[...document.querySelectorAll('.hc .hi:not(.noimg) img')].filter(i=>i.complete&&!i.naturalWidth).length,empty:[...document.querySelectorAll('.hc .hi:not(.noimg)')].filter(h=>!h.querySelector('img')).length,grad:document.querySelectorAll('.hc .hi.noimg').length,hidden:document.getElementById('hs').hidden}));
// A) photo scenarios
for(const mode of ['lead','flag','gal','none','fail','bad','brokenimg','slow']){
 for(const d of ['India','Paris','Riyadh','الطائف']){
  const pg=await page(mode);await pg.goto(B+'/results.html?d='+encodeURIComponent(d),{waitUntil:'networkidle2'});await sleep(mode==='slow'?3500:1300);
  await pg.evaluate(async()=>{for(let y=0;y<document.documentElement.scrollHeight;y+=500){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,60));}});await sleep(500);
  const s=await st(pg);const good=!s.hidden&&s.cards>=5&&s.broken===0&&s.empty===0&&pg._errs.length===0&&pg._404.filter(x=>!/nope\.jpg|img\/cities/.test(x)).length===0;
  ok('photos['+mode+'] '+d,good,JSON.stringify(s)+' '+pg._errs.join('|')+' '+pg._404.join(','));await pg.close();}}
// B) functional on results
{const pg=await page('lead');await pg.goto(B+'/results.html?d=Dubai&ci=2026-12-10&co=2026-12-13&a=2&r=1',{waitUntil:'networkidle2'});await sleep(800);
 // open filters and click every chip
 await pg.evaluate(()=>{const p=document.getElementById('fpanel');if(p.classList.contains('shut'))document.getElementById('fToggle').click();});await sleep(200);
 const n=await pg.evaluate(()=>document.querySelectorAll('#fpanel .chip').length);let bad=0;
 for(let i=0;i<n;i++){await pg.evaluate(i=>{const c=document.querySelectorAll('#fpanel .chip')[i];c&&c.click();},i);await sleep(60);
  const r=await pg.evaluate(()=>({pc:document.querySelectorAll('.pc .cta').length,hrefs:[...document.querySelectorAll('.pc .cta')].every(a=>/^https:\/\/(www\.)?(hotels|expedia|booking|stay22)\.com/.test(a.href))}));if(r.pc<2||!r.hrefs)bad++;}
 ok('filters: all '+n+' chips clickable, site links valid',bad===0&&pg._errs.length===0,pg._errs.join('|'));
 await pg.goto(B+'/results.html?d=Dubai',{waitUntil:'networkidle2'});await sleep(600);
 // tabs
 const tb=await pg.evaluate(async()=>{const r=[];const n=document.querySelectorAll('#htabs .chip').length;for(let i=0;i<n;i++){document.querySelectorAll('#htabs .chip')[i].click();await new Promise(x=>setTimeout(x,50));r.push(document.querySelectorAll('.hc').length);}document.querySelectorAll('#htabs .chip')[0].click();return r;});
 ok('tabs each show hotels',tb.every(x=>x>0),tb.join(','));
 // sheet
 await pg.evaluate(()=>document.querySelector('.hc').click());await sleep(500);
 const sh=await pg.evaluate(()=>({open:!document.getElementById('sh').hidden,links:[...document.querySelectorAll('.sha')].map(a=>a.href),name:document.getElementById('shN').textContent}));
 ok('sheet opens with 4 links (Hotels.com, Expedia, Booking.com, Agoda)',sh.open&&sh.links.length===4&&sh.links.every(h=>h.startsWith('https://')),sh.name);
 ok('sheet: Booking.com and Agoda go through Stay22 with our aid',/^https:\/\/www\.stay22\.com\/allez\/booking\?aid=nuzul&/.test(sh.links[2])&&/^https:\/\/www\.stay22\.com\/allez\/agoda\?aid=nuzul&/.test(sh.links[3])&&/hotelname=/.test(sh.links[3]),sh.links[3]);
 ok('sheet links carry tracking',/camref=1011l6vPKX/.test(decodeURIComponent(sh.links[0]))&&/camref=1101l6yQPk/.test(decodeURIComponent(sh.links[1])));
 // «احجز إقامتك وارجع لنا»: قائمة «حول الفندق» تنفتح وتنقفل داخل نفس البطاقة، ولما يرجع من موقع الحجز تنفتح لحالها
 const nl=await pg.evaluate(async()=>{const w=t=>new Promise(r=>setTimeout(r,t));const b=document.getElementById('pmh'),l=document.getElementById('pml');if(!b||!l)return 'missing';
  const r=[l.hidden,b.getAttribute('aria-expanded'),document.querySelectorAll('#shp .shnr').length,!!l.querySelector('.shnr')];b.click();await w(150);
  r.push(!l.hidden&&l.offsetHeight>0,b.getAttribute('aria-expanded'),l.querySelectorAll('.shnr a[href^="https://"]').length,getComputedStyle(b.querySelector('.pmx')).display!=='none');b.click();await w(150);r.push(l.hidden,b.getAttribute('aria-expanded'));
  document.getElementById('sh').dataset.went='1';window.dispatchEvent(new Event('focus'));await w(200);r.push(!l.hidden,!!l.querySelector('.shnr.back'));return r.join(',');});
 ok('sheet: nearby list opens and closes inside the card, opens itself after returning from booking',nl==='true,false,1,true,true,true,7,true,true,false,true,true',nl);
 await pg.keyboard.press('Escape');await sleep(500);ok('sheet closes on Escape',await pg.evaluate(()=>document.getElementById('sh').hidden||!document.getElementById('sh').classList.contains('on')));
 // favourite
 const fv=await pg.evaluate(async()=>{const f=document.querySelector('.hc .fv');if(!f)return 'nofav';f.click();await new Promise(x=>setTimeout(x,150));const on=document.querySelector('.hc .fv').classList.contains('on');document.querySelector('.hc .fv').click();await new Promise(x=>setTimeout(x,150));return on+'/'+document.querySelector('.hc .fv').classList.contains('on');});
 ok('favourite toggles',fv==='true/false',fv);
 // language
 await pg.evaluate(()=>document.getElementById('langBtn').click());await sleep(500);
 const en=await pg.evaluate(()=>({dir:document.documentElement.dir,t:document.getElementById('title').textContent,h:document.getElementById('hsTitle').textContent,btn:document.querySelector('.hc .cmp').textContent,ar:[...document.querySelectorAll('main h2,main h3,.cmp,.pc .cta,.chip,#tipTxt')].filter(e=>/[؀-ۿ]/.test(e.textContent)).length}));
 ok('english mode: ltr and no Arabic left in headings/buttons',en.dir==='ltr'&&en.ar===0,JSON.stringify(en));
 await pg.evaluate(()=>document.getElementById('langBtn').click());await sleep(300);
 // edit form
 await pg.evaluate(()=>{document.getElementById('editBtn').click();const d=document.getElementById('e_dest');d.value='باريس';document.getElementById('e_ad').value='3';document.getElementById('e_go').click();});await sleep(1200);
 const ed=await pg.evaluate(()=>({t:document.getElementById('title').textContent,h:document.getElementById('hsTitle').textContent,url:location.search,c:document.querySelectorAll('.hc').length}));
 ok('edit search to باريس shows Paris list',/باريس/.test(ed.t)&&/باريس/.test(ed.h)&&ed.c>=8,JSON.stringify(ed));
 const ct=await pg.evaluate(()=>{const m=document.getElementById('mailBtn');return {href:m?m.getAttribute('href'):'',wa:document.querySelectorAll('a[href*="wa.me"]').length}});
 ok('results: contact is email with the search attached, no WhatsApp chat link',/^mailto:info@nuzultravel\.com\?subject=.+&body=.+/.test(ct.href)&&ct.wa===0,JSON.stringify(ct).slice(0,200));
 ok('results: no JS errors, no missing files',pg._errs.length===0&&pg._404.length===0,pg._errs.join('|')+pg._404.join(','));await pg.close();}
// C) home page
{const pg=await page('lead');await pg.goto(B+'/',{waitUntil:'networkidle2'});await sleep(1500);
 await pg.evaluate(async()=>{for(let y=0;y<document.documentElement.scrollHeight;y+=500){window.scrollTo(0,y);await new Promise(r=>setTimeout(r,80));}window.scrollTo(0,0)});await sleep(600);
 const h=await pg.evaluate(()=>({sw:document.documentElement.scrollWidth,imgs:[...document.images].filter(i=>i.complete&&!i.naturalWidth).map(i=>i.src),links:[...new Set([...document.querySelectorAll('a[href]')].map(a=>a.getAttribute('href')))],hero:document.querySelector('.hero').classList.contains('has-img')}));
 ok('home: no horizontal overflow',h.sw<=390,String(h.sw));ok('home: no broken images',h.imgs.length===0,h.imgs.join(','));ok('home: hero photo loaded',h.hero);
 // background images existence
 const bg=await pg.evaluate(()=>[...document.querySelectorAll('.city,.deal .ph,.ph')].map(e=>(getComputedStyle(e).backgroundImage.match(/url\("([^"]+)"\)/)||[])[1]).filter(Boolean));
 let miss=[];for(const u of [...new Set(bg)]){const r=await pg.evaluate(async u=>{try{const x=await fetch(u,{method:'HEAD'});return x.status}catch(e){return 0}},u);if(r!==200)miss.push(u);}
 ok('home: all destination/deal photos exist ('+new Set(bg).size+')',miss.length===0,miss.join(','));
 // internal links
 let badl=[];for(const l of h.links.filter(x=>x.startsWith('/')&&!x.startsWith('//'))){const r=await pg.evaluate(async u=>{try{const x=await fetch(u.split('?')[0],{method:'HEAD'});return x.status}catch(e){return 0}},l);if(r!==200)badl.push(l);}
 ok('home: internal links resolve',badl.length===0,badl.join(','));
 // search flow
 await pg.evaluate(()=>{const d=document.getElementById('dest');d.value='الرياض';d.dispatchEvent(new Event('input',{bubbles:true}));});
 await Promise.all([pg.waitForNavigation({waitUntil:'networkidle2',timeout:15000}).catch(()=>{}),pg.evaluate(()=>document.getElementById('go').click())]);await sleep(900);
 const s=await pg.evaluate(()=>({u:location.pathname+location.search,c:document.querySelectorAll('.hc').length,h:(document.getElementById('hsTitle')||{}).textContent}));
 ok('home search الرياض -> Riyadh list',/results\.html/.test(s.u)&&/d=Riyadh/.test(s.u)&&s.c>=8,JSON.stringify(s));
 // empty search validation
 await pg.goto(B+'/',{waitUntil:'networkidle2'});await sleep(800);
 await pg.evaluate(()=>{document.getElementById('dest').value='';document.getElementById('go').click()});await sleep(400);
 ok('home: empty destination does not navigate',await pg.evaluate(()=>location.pathname==='/'));
 // language toggle
 await pg.evaluate(()=>document.getElementById('langBtn').click());await sleep(700);
 const e=await pg.evaluate(()=>({dir:document.documentElement.dir,sw:document.documentElement.scrollWidth,ar:[...document.querySelectorAll('h1,h2,h3,button,.nz-badges span,.xt b,.type b')].filter(x=>x.offsetParent&&/[؀-ۿ]/.test(x.textContent)&&x.id!=='langBtn').map(x=>x.textContent.trim().slice(0,25))}));
 ok('home english: ltr, no overflow, no Arabic left',e.dir==='ltr'&&e.sw<=390&&e.ar.length===0,JSON.stringify(e));
 await pg.evaluate(()=>document.getElementById('langBtn').click());await sleep(300);
 const hc=await pg.evaluate(()=>({wa:document.querySelectorAll('a[href*="wa.me"]').length,fab:!!document.querySelector('.wa-fab'),mail:document.querySelectorAll('footer a[href^="mailto:info@nuzultravel.com"]').length}));
 ok('home: contact is email, no WhatsApp chat link or floating button',hc.wa===0&&!hc.fab&&hc.mail>=1,JSON.stringify(hc));
 ok('home: no JS errors, no missing files',pg._errs.length===0&&pg._404.length===0,pg._errs.join('|')+pg._404.join(','));await pg.close();}
// D) pull to refresh
for(const u of ['/','/results.html?d=Dubai']){const pg=await page('lead');await pg.goto(B+u,{waitUntil:'networkidle2'});await sleep(700);
 let nav=0;pg.on('framenavigated',f=>{if(f===pg.mainFrame())nav++});
 const cdp=await pg.createCDPSession();const drag=async(y0,y1)=>{await cdp.send('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{x:200,y:y0}]});for(let y=y0;y<=y1;y+=20){await cdp.send('Input.dispatchTouchEvent',{type:'touchMove',touchPoints:[{x:200,y}]});await sleep(12);}await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});};
 await pg.evaluate(()=>window.scrollTo(0,600));await sleep(200);await drag(300,640);await sleep(900);ok('pull-refresh '+u+': no reload when scrolled down',nav===0,String(nav));
 await pg.evaluate(()=>window.scrollTo(0,0));await sleep(200);await drag(300,360);await sleep(900);ok('pull-refresh '+u+': short pull does nothing',nav===0,String(nav));
 await drag(250,640);await sleep(1500);ok('pull-refresh '+u+': long pull reloads',nav>=1,String(nav));await pg.close();}
// E) desktop
for(const u of ['/','/results.html?d=Tokyo']){const pg=await page('lead',{width:1366,height:800});await pg.goto(B+u,{waitUntil:'networkidle2'});await sleep(1200);
 const r=await pg.evaluate(()=>({sw:document.documentElement.scrollWidth,w:innerWidth}));ok('desktop '+u+': no overflow, no errors',r.sw<=r.w&&pg._errs.length===0,JSON.stringify(r)+pg._errs.join('|'));await pg.close();}
console.log(out.filter(x=>x.startsWith('FAIL')).join('\n')||'NO FAILURES');console.log('total',out.length,'pass',out.filter(x=>x.startsWith('PASS')).length);if(out.some(x=>x.startsWith('FAIL')))process.exitCode=1;
if (process.env.OUT) require('fs').writeFileSync(process.env.OUT,out.join('\n'));await b.close();})();
