// Renders NUZUL's still graphics from the HTML templates in this folder (headless Chrome).
//   node studio/graphics/shot.js launch <outdir>   the four launch images (kept in media/nuzul_launch_*.png)
//   node studio/graphics/shot.js covers <outdir>   profile covers for X, Facebook, YouTube and Snapchat
// Needs puppeteer-core (npm i puppeteer-core, or PUPPETEER=/path/to/puppeteer-core) and Chrome (CHROME=/path/to/chrome).
const path = require('path');
let puppeteer;
try { puppeteer = require('puppeteer-core'); } catch (e) { puppeteer = require(process.env.PUPPETEER || '/tmp/node_modules/puppeteer-core'); }
const LAUNCH = [['nuzul_launch_square_1080', 1080, 1080], ['nuzul_launch_story_1080x1920', 1080, 1920],
  ['nuzul_launch_pin_1000x1500', 1000, 1500], ['nuzul_launch_wide_1600x900', 1600, 900]];
// name, width, height, width of the centred scene, vertical shift of the scene
const COVERS = [['nuzul_cover_x_1500x500', 1500, 500, 1500, 0], ['nuzul_cover_facebook_1640x624', 1640, 624, 1640, 22],
  ['nuzul_cover_youtube_2560x1440', 2560, 1440, 1546, 0]];
const wait = ms => new Promise(r => setTimeout(r, ms));
(async () => {
  const what = process.argv[2], out = path.resolve(process.argv[3] || '.');
  if (what !== 'launch' && what !== 'covers') { console.error('usage: node shot.js launch|covers <outdir>'); process.exit(2); }
  const browser = await puppeteer.launch({ executablePath: process.env.CHROME || '/usr/bin/google-chrome', args: ['--no-sandbox', '--allow-file-access-from-files'] });
  const open = async (file, query, w, h) => {
    const pg = await browser.newPage();
    await pg.setViewport({ width: w, height: h });
    await pg.goto('file://' + path.join(__dirname, file) + query);
    await pg.evaluate(() => document.fonts.ready);
    return pg;
  };
  if (what === 'launch') {
    for (const [n, w, h] of LAUNCH) {
      const pg = await open('launch.html', '?w=' + w + '&h=' + h, w, h);
      const u = await pg.evaluate(() => window.fit());      // scales the layout to fill the canvas
      await wait(300);
      await pg.screenshot({ path: path.join(out, n + '.png') });
      console.log(n, 'unit', u.toFixed(3)); await pg.close();
    }
  } else {
    for (const [n, w, h, sw, dy] of COVERS) {
      const pg = await open('cover.html', '?w=' + w + '&h=' + h + '&sw=' + sw + '&dy=' + dy, w, h);
      await wait(300);
      const tw = await pg.evaluate(() => { const r = document.createRange(); r.selectNodeContents(document.getElementById('tag')); return Math.round(r.getBoundingClientRect().width); });
      await pg.screenshot({ path: path.join(out, n + '.png') });
      console.log(n, 'tagline width', tw); await pg.close();
    }
    const pg = await open('snap_cover.html', '', 1000, 1500);
    await wait(500);
    await pg.screenshot({ path: path.join(out, 'nuzul_cover_snapchat_1000x1500.png') });
    console.log('nuzul_cover_snapchat_1000x1500'); await pg.close();
  }
  await browser.close();
})();
