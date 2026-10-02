/* 平衡诊断：只跑 AI 试玩，输出死亡明细 */
const { chromium } = require('playwright');
const BASE = 'http://127.0.0.1:8077/';
(async () => {
  const browser = await chromium.launch({ channel: 'msedge', headless: true });
  const seeds = process.argv[2] ? process.argv[2].split(',') : [12, 34, 56];
  const dmg = process.argv[3] || '1';
  const runs = seeds.map(async seed => {
    const ctx = await browser.newContext({ viewport: { width: 900, height: 1000 } });
    const p = await ctx.newPage();
    await p.goto(BASE + `?auto=1&ts=3&dmg=${dmg}&seed=${seed}`);
    await p.click('#btn-start');
    const t0 = Date.now();
    while (Date.now() - t0 < 420000) {
      await p.waitForTimeout(2500);
      const st = await p.evaluate(() => __dh.state).catch(() => 'gone');
      if (st === 'win' || st === 'over') break;
    }
    const fin = await p.evaluate(() => ({
      state: __dh.state, boss: __dh.bossIndex, lives: __dh.lives, bombs: __dh.bombs,
      score: __dh.score, graze: __dh.graze, maxB: __dh.maxBullets,
      time: Math.round(__dh.time), death: __dh.lastDeath,
    }));
    console.log(`seed=${seed} → ${fin.state} boss=${fin.boss} lives=${fin.lives} bombs=${fin.bombs} maxB=${fin.maxB} t=${fin.time}s death=${JSON.stringify(fin.death)}`);
    await ctx.close();
  });
  await Promise.all(runs);
  await browser.close();
})().catch(e => { console.error('FATAL', e); process.exit(2); });
