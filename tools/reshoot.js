/* 重截 Boss1 最终阶段截图（避开炸弹清屏时机） */
const { chromium } = require('playwright');
const path = require('path');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  await page.goto('http://127.0.0.1:8077/?seed=101');
  await page.click('#btn-start');
  await page.waitForFunction(() => __dh.stage === 'fight', null, { timeout: 15000 });
  await page.evaluate(() => { __dh.god = true; });
  await page.evaluate(() => __dh.setHp(0.25));
  await page.waitForFunction(() => __dh.phase === 3, null, { timeout: 5000 });
  /* 等阶段切换清弹效果消退、螺旋展开 */
  await page.waitForTimeout(6500);
  await page.screenshot({ path: path.join(__dirname, '..', 'shots', '03-boss1-phase3.png') });
  console.log('done, bullets=', await page.evaluate(() => __dh.bullets));
  await browser.close();
})().catch(e => { console.error('FATAL', e.message); process.exit(2); });
