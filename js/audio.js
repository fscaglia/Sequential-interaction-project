// Synthesized sound effects (Web Audio API, no audio files).
// Browsers only allow sound after the user interacts, so Sfx.unlock() is
// called on the first pointer or key press; until then every effect is silent.
(function () {
  let ctx = null;

  function unlock() {
    try {
      ctx = ctx || new (window.AudioContext || window.webkitAudioContext)();
      if (ctx.state === 'suspended') ctx.resume();
    } catch (e) { ctx = null; }
  }

  // Filtered noise burst: the switch study's "clack", reused for keys and the button
  function noise(pitch, len, gain, q) {
    if (!ctx) return;
    try {
      const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * len), ctx.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 5);
      const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
      f.type = 'bandpass'; f.frequency.value = pitch; f.Q.value = q || 2.5; g.gain.value = gain;
      src.buffer = buf; src.connect(f).connect(g).connect(ctx.destination); src.start();
    } catch (e) {}
  }

  // Simple enveloped oscillator
  function tone(freq, start, dur, gain, type) {
    if (!ctx) return;
    try {
      const t = ctx.currentTime + start;
      const o = ctx.createOscillator(), g = ctx.createGain();
      o.type = type || 'sine'; o.frequency.value = freq;
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(gain, t + 0.005);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(ctx.destination); o.start(t); o.stop(t + dur + 0.02);
    } catch (e) {}
  }

  window.Sfx = {
    unlock,
    clack: (pitch) => noise(pitch, 0.035, 0.55),       // switch (study values: 1500 on)
    key: () => noise(2600, 0.025, 0.35, 3),             // keypad key
    thunk: () => noise(500, 0.06, 0.8, 1.5),            // big button bottoming out
    tick: (urgent) => tone(urgent ? 1650 : 1050, 0, 0.05, 0.12, 'square'),
    buzz: () => { tone(140, 0, 0.32, 0.18, 'sawtooth'); tone(147, 0, 0.32, 0.12, 'sawtooth'); },
    accept: () => { tone(988, 0, 0.12, 0.15); tone(1319, 0.08, 0.16, 0.15); },
    chime: () => { [784, 988, 1175, 1568].forEach((f, i) => tone(f, i * 0.11, 0.6, 0.16)); },

    // Low thump plus a long noise roar with a falling filter
    explosion: () => {
      if (!ctx) return;
      try {
        const t = ctx.currentTime, len = 2.2;
        const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * len), ctx.sampleRate);
        const d = buf.getChannelData(0);
        for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 2);
        const src = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
        f.type = 'lowpass'; f.frequency.setValueAtTime(2400, t); f.frequency.exponentialRampToValueAtTime(70, t + len);
        g.gain.setValueAtTime(0.9, t);
        src.buffer = buf; src.connect(f).connect(g).connect(ctx.destination); src.start(t);

        const o = ctx.createOscillator(), og = ctx.createGain();
        o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(32, t + 0.8);
        og.gain.setValueAtTime(0.9, t); og.gain.exponentialRampToValueAtTime(0.0001, t + 0.9);
        o.connect(og).connect(ctx.destination); o.start(t); o.stop(t + 1);
      } catch (e) {}
    },
  };
})();
