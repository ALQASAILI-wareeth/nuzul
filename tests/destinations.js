const p=require(process.env.PUPPETEER || 'puppeteer-core');const D=require('./dests.json');
(async()=>{const b=await p.launch({executablePath:process.env.CHROME || '/usr/bin/google-chrome',args:['--no-sandbox']});
const pg=await b.newPage();const errs=[];pg.on('pageerror',e=>errs.push(e.message));
await pg.setViewport({width:390,height:844,isMobile:true,hasTouch:true});
await pg.setRequestInterception(true);pg.on('request',r=>{const u=r.url();(/wikipedia|wikimedia|cloudflare|googleapis|gstatic/.test(u))?r.abort():r.continue();});
const bad=[];let n=0;
async function t(label,q){await pg.goto((process.env.BASE || 'http://localhost:8765')+'/results.html?'+q,{waitUntil:'domcontentloaded'});await new Promise(r=>setTimeout(r,250));
 const r=await pg.evaluate(()=>({h:document.getElementById('hs').hidden,c:document.querySelectorAll('.hc').length,t:document.getElementById('title').textContent}));n++;
 if(r.h||r.c<5) bad.push(label+' => '+JSON.stringify(r));}
for(const [ar,en] of D.cities){await t('en:'+en,'d='+encodeURIComponent(en)+'&n='+encodeURIComponent(ar));await t('ar-typed:'+ar,'d='+encodeURIComponent(ar)+'&n='+encodeURIComponent(ar));await t('enUI:'+en,'d='+encodeURIComponent(en)+'&lang=en');}
for(const c of D.deals){await t('deal:'+c,'d='+encodeURIComponent(c));}
console.log('tested',n,'cities',D.cities.length,'deals',D.deals.join(','));console.log('BAD',bad.length);if(bad.length)process.exitCode=1;bad.forEach(x=>console.log(x));console.log(errs.slice(0,3));
await b.close();})();
