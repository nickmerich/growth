// Tiny WebAudio helper for race-day cues (countdown beeps, buzzer, tap click).
// No assets needed — synthesised tones so it works offline.
let ctx = null;

function audio() {
  if (typeof window === 'undefined') return null;
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (AC) ctx = new AC();
  }
  if (ctx && ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq, durationMs, { type = 'sine', gain = 0.25 } = {}) {
  const ac = audio();
  if (!ac) return;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(gain, ac.currentTime);
  g.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + durationMs / 1000);
  osc.connect(g);
  g.connect(ac.destination);
  osc.start();
  osc.stop(ac.currentTime + durationMs / 1000);
}

export const beep = () => tone(660, 180, { type: 'square', gain: 0.2 });
export const buzzer = () => tone(180, 520, { type: 'sawtooth', gain: 0.32 });
export const click = () => tone(1200, 45, { type: 'square', gain: 0.14 });

export function vibrate(ms = 12) {
  if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(ms);
}

// Unlock audio on first user gesture (browsers require it).
export function primeAudio() {
  audio();
}
