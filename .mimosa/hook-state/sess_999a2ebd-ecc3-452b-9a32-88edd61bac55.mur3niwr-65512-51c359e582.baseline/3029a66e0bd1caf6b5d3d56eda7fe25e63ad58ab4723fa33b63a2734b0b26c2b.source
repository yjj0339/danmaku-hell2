/* 临时调试：跟踪游戏状态推进与页面报错（NODE_PATH 指向复用的 playwright） */
const { chromium } = require('playwright');
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.on('pageerror', e => console.log('PAGEERROR:', e.message));
  page.on('console', m => { if (m.type() === 'error') console.log('CONSOLE:', m.text()); });
  await page.goto('http://127.0.0.1:8077/?seed=101');
  await page.click('#btn-start');
  for (let i = 0; i < 6; i++) {
    await page.waitForTimeout(1500);
    const s = await page.evaluate(() => ({
      state: __dh.state, stage: __dh.stage, time: __dh.time,
      boss: __dh.bossIndex, hp: __dh.hp, bullets: __dh.bullets, fps: __dh.fps,
    }));
    console.log(i, JSON.stringify(s));
  }
  await browser.close();
})().catch(e => console.error('FATAL', e.message));
