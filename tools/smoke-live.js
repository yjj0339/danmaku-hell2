/* 线上版冒烟验证：桌面加载可玩 + 手机宽度截图 */
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const URL = 'https://yjj0339.github.io/danmaku-hell2/';
  const errors = [];

  // 桌面：加载 + 开始 + 战斗
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.goto(URL, { waitUntil: 'networkidle' });
  await page.click('#btn-start');
  await page.waitForFunction(() => window.__dh && __dh.state === 'playing', null, { timeout: 8000 });
  await page.waitForFunction(() => __dh.stage === 'fight', null, { timeout: 15000 });
  await page.waitForTimeout(2500);
  const st = await page.evaluate(() => ({ boss: __dh.bossIndex, bullets: __dh.bullets, fps: __dh.fps }));
  console.log('线上桌面:', JSON.stringify(st));
  if (st.bullets < 5) { console.log('FAIL: 弹幕未生成'); process.exit(1); }

  // 手机宽度（线上）
  const mpage = await browser.newPage({ viewport: { width: 390, height: 844 }, hasTouch: true, isMobile: true });
  mpage.on('pageerror', e => errors.push('mobile pageerror: ' + e.message));
  await mpage.goto(URL, { waitUntil: 'networkidle' });
  await mpage.screenshot({ path: path.join(__dirname, '..', 'shots', '09-mobile-live-start.png') });
  await mpage.tap('#btn-start');
  await mpage.waitForFunction(() => window.__dh && __dh.state === 'playing', null, { timeout: 8000 });
  await mpage.waitForFunction(() => __dh.stage === 'fight', null, { timeout: 15000 });
  await mpage.waitForTimeout(2500);
  await mpage.screenshot({ path: path.join(__dirname, '..', 'shots', '10-mobile-live-fight.png') });
  const mst = await mpage.evaluate(() => ({ boss: __dh.bossIndex, bullets: __dh.bullets }));
  console.log('线上手机:', JSON.stringify(mst));

  if (errors.length) { console.log('JS ERRORS:', errors.slice(0, 5)); process.exit(1); }
  console.log('线上冒烟通过，无 JS 错误');
  await browser.close();
})().catch(e => { console.error('FATAL', e.message); process.exit(2); });
