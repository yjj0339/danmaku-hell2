/* 弹幕地狱 · Web Audio 合成音效（无外部素材） */
const SFX = (() => {
  let ac = null, master = null, nb = null;
  let muted = false;
  try { muted = localStorage.getItem('dh_mute') === '1'; } catch (e) {}
  const last = {};

  function ensure() {
    if (!ac) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return false;
      ac = new AC();
      master = ac.createGain();
      master.gain.value = muted ? 0 : 0.85;
      master.connect(ac.destination);
    }
    if (ac.state === 'suspended') ac.resume();
    return true;
  }
  function throttled(k, ms) {
    const n = performance.now();
    if (last[k] && n - last[k] < ms) return true;
    last[k] = n; return false;
  }
  function tone(type, f0, f1, dur, vol, delay = 0, lin = false) {
    if (!ac || muted) return;
    const t = ac.currentTime + delay;
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type;
    o.frequency.setValueAtTime(Math.max(1, f0), t);
    o.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
    if (lin) o.frequency.linearRampToValueAtTime(Math.max(1, f1), t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(Math.max(0.001, vol), t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(master);
    o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(dur, vol, f0, f1, delay = 0) {
    if (!ac || muted) return;
    if (!nb) {
      const len = Math.floor(ac.sampleRate * 1.2);
      nb = ac.createBuffer(1, len, ac.sampleRate);
      const d = nb.getChannelData(0);
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    }
    const t = ac.currentTime + delay;
    const src = ac.createBufferSource(); src.buffer = nb; src.loop = true;
    const f = ac.createBiquadFilter(); f.type = 'lowpass';
    f.frequency.setValueAtTime(f0, t);
    f.frequency.exponentialRampToValueAtTime(Math.max(40, f1), t + dur);
    const g = ac.createGain();
    g.gain.setValueAtTime(Math.max(0.001, vol), t);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f); f.connect(g); g.connect(master);
    src.start(t); src.stop(t + dur + 0.05);
  }

  return {
    unlock() { ensure(); },
    get muted() { return muted; },
    toggleMute() {
      muted = !muted;
      try { localStorage.setItem('dh_mute', muted ? '1' : '0'); } catch (e) {}
      if (master) master.gain.value = muted ? 0 : 0.85;
      return muted;
    },
    shoot()  { if (throttled('sh', 80)) return; tone('triangle', 920 + Math.random() * 120, 500, 0.055, 0.04); },
    hit()    { if (throttled('hit', 55)) return; tone('square', 185, 130, 0.045, 0.032); },
    graze()  { if (throttled('gz', 75)) return; tone('sine', 1480, 1900, 0.05, 0.028); },
    boom(big) { noise(big ? 0.95 : 0.5, big ? 0.55 : 0.3, big ? 1600 : 900, 60); tone('sine', big ? 115 : 90, 28, big ? 0.75 : 0.4, big ? 0.42 : 0.22); },
    bomb()   { tone('sawtooth', 130, 950, 0.3, 0.16, 0, true); noise(0.75, 0.5, 2600, 80, 0.2); tone('sine', 72, 26, 0.85, 0.4, 0.2); },
    alarm()  { for (let i = 0; i < 3; i++) { tone('square', 660, 660, 0.09, 0.09, i * 0.19); tone('square', 494, 494, 0.09, 0.09, i * 0.19 + 0.095); } },
    phase()  { tone('square', 520, 900, 0.16, 0.11); tone('square', 880, 1350, 0.2, 0.09, 0.15); },
    death()  { tone('sawtooth', 620, 55, 0.55, 0.2, 0, true); noise(0.65, 0.42, 1300, 70, 0.05); },
    ui()     { tone('sine', 740, 990, 0.07, 0.07); },
    win()    { [523, 659, 784, 1047].forEach((f, i) => tone('triangle', f, f, 0.18, 0.11, i * 0.13)); },
    over()   { [392, 330, 262, 196].forEach((f, i) => tone('triangle', f, f, 0.24, 0.11, i * 0.17)); },
  };
})();
