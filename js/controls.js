// Floating, collapsible control panel (left side) for tuning the prototype.
// Each control (switch, keypad, button) has its own Animation, Appearance,
// Layout & quantity and Interaction settings. Visual settings are applied
// here as CSS custom properties / attributes; main.js reads the behavioral
// ones (delays, hold, drag, code length) through window.Anim.
//
// DEFAULTS below are the prototype's saved defaults. "Restore defaults"
// returns to them; "Copy settings" copies the current values so they can be
// made the new saved defaults.
(function () {
  const STORE_KEY = 'defuse-panel-v2';

  // ---------- Saved defaults (reproduce the original studies) ----------

  const DEFAULTS = {
    switch: {
      speed: 1, duration: 280, delay: 180, easing: 'study', bounce: 0, travel: 34,
      fill: '#b0b0b0', texture: 'none', asset: 'study', opacity: 100, stroke: 4, radius: 14, shadow: 0,
      spacing: 14, x: 0, y: 0, rotation: 0, count: 3,
      sensitivity: 1, snap: 6, threshold: 50,
    },
    keypad: {
      speed: 1, duration: 70, delay: 200, easing: 'study', bounce: 0, travel: 3,
      fill: '#dddddd', texture: 'none', asset: 'study', opacity: 100, stroke: 1.5, radius: 5, shadow: 0,
      spacing: 14, x: 0, y: 0, rotation: 0, count: 4,
      hold: 0,
    },
    button: {
      speed: 1, duration: 90, delay: 350, easing: 'study', bounce: 0, travel: 12,
      fill: '#9a9a9a', texture: 'none', asset: 'study', opacity: 100, stroke: 0, radius: 50, shadow: 100,
      spacing: 14, x: 0, y: 0, rotation: 0, count: 0,
      hold: 0,
    },
  };

  const EASINGS = {
    'study':       { label: 'Study default' },
    'ease-out':    { label: 'Ease out',    pts: [0, 0, 0.58, 1] },
    'ease-in-out': { label: 'Ease in-out', pts: [0.42, 0, 0.58, 1] },
    'ease-in':     { label: 'Ease in',     pts: [0.42, 0, 1, 1] },
    'linear':      { label: 'Linear',      pts: [0, 0, 1, 1] },
    'snappy':      { label: 'Snappy',      pts: [0.2, 0.9, 0.1, 1] },
    'back-out':    { label: 'Back out',    pts: [0.34, 1.56, 0.64, 1] },
  };
  const STUDY_EASE = { switch: [0.3, 1.5, 0.5, 1], keypad: [0, 0, 0.58, 1], button: [0, 0, 0.58, 1] };

  const TEXTURES = { none: 'None', brushed: 'Brushed metal', grain: 'Grain', stripes: 'Hazard stripes', dots: 'Rubber dots' };
  const ASSETS = {
    switch: { study: 'Interactive (study)', file: 'assets/switch.svg' },
    keypad: { study: 'Interactive (study)', file: 'assets/keypad.svg' },
    button: { study: 'Interactive (study)', file: 'assets/button.svg' },
  };

  const LABELS = { switch: 'Switch', keypad: 'Keypad', button: 'Button' };

  // ---------- Parameter definitions per control ----------

  const ms = v => `${v}ms`, pct = v => `${v}%`, px = v => `${v}px`, deg = v => `${v}°`, x = v => `${Number(v).toFixed(2)}×`;
  const u = v => `${v}u`;   // SVG user units

  function paramsFor(ctrl) {
    const travel = {
      switch: { hint: 'Lever throw', min: 0, max: 40, step: 1, fmt: u },
      keypad: { hint: 'Key press depth', min: 0, max: 8, step: 0.5, fmt: u },
      button: { hint: 'Press depth', min: 0, max: 28, step: 1, fmt: px },
    }[ctrl];
    const delayHint = { switch: 'Lever → light & code', keypad: 'Last digit → code check', button: 'Press → DEFUSED' }[ctrl];
    const fillHint = { switch: 'Switch plate', keypad: 'Key caps', button: 'Button face' }[ctrl];
    const stroke = { switch: { min: 0, max: 10, step: 0.5, hint: 'Plate outline' }, keypad: { min: 0, max: 5, step: 0.5, hint: 'Key outline' }, button: { min: 0, max: 8, step: 0.5, hint: 'Button outline' } }[ctrl];
    const radius = { switch: { min: 0, max: 45, step: 1, fmt: u, hint: 'Plate corners' }, keypad: { min: 0, max: 20, step: 0.5, fmt: u, hint: 'Key corners' }, button: { min: 0, max: 50, step: 1, fmt: pct, hint: 'Button corners (50% = circle)' } }[ctrl];
    const count = {
      switch: { label: 'Grip lines', min: 0, max: 6, step: 1, hint: 'Lines on the lever' },
      keypad: { label: 'Code length', min: 3, max: 6, step: 1, hint: 'Digits; applies from the next round' },
      button: { label: 'Rings', min: 0, max: 3, step: 1, hint: 'Rings around the button' },
    }[ctrl];

    const p = [
      { group: 'Animation', key: 'speed', label: 'Speed', type: 'range', min: 0.25, max: 3, step: 0.05, fmt: x, hint: 'Multiplies duration and delay' },
      { group: 'Animation', key: 'duration', label: 'Duration', type: 'range', min: 0, max: 1000, step: 5, fmt: ms },
      { group: 'Animation', key: 'delay', label: 'Delay', type: 'range', min: 0, max: 1500, step: 10, fmt: ms, hint: delayHint },
      { group: 'Animation', key: 'easing', label: 'Easing', type: 'select', options: Object.fromEntries(Object.entries(EASINGS).map(([k, v]) => [k, v.label])) },
      { group: 'Animation', key: 'bounce', label: 'Bounce', type: 'range', min: 0, max: 100, step: 5, fmt: pct, hint: 'Overshoot past the end, then settle' },
      { group: 'Animation', key: 'travel', label: 'Travel distance', type: 'range', ...travel },

      { group: 'Appearance', key: 'fill', label: 'Fill color', type: 'color', hint: fillHint },
      { group: 'Appearance', key: 'texture', label: 'Texture', type: 'select', options: TEXTURES },
      { group: 'Appearance', key: 'asset', label: 'SVG asset', type: 'select', options: { study: ASSETS[ctrl].study, file: ASSETS[ctrl].file }, hint: 'A static asset replaces the artwork; the control still works' },
      { group: 'Appearance', key: 'opacity', label: 'Opacity', type: 'range', min: 10, max: 100, step: 5, fmt: pct },
      { group: 'Appearance', key: 'stroke', label: 'Stroke width', type: 'range', fmt: ctrl === 'button' ? px : u, ...stroke },
      { group: 'Appearance', key: 'radius', label: 'Corner radius', type: 'range', ...radius },
      { group: 'Appearance', key: 'shadow', label: 'Shadow', type: 'range', min: 0, max: 200, step: 5, fmt: pct },

      { group: 'Layout & quantity', key: 'spacing', label: 'Spacing', type: 'range', min: 0, max: 48, step: 1, fmt: px, hint: 'Gap between parts of the module' },
      { group: 'Layout & quantity', key: 'x', label: 'Position X', type: 'range', min: -80, max: 80, step: 1, fmt: px },
      { group: 'Layout & quantity', key: 'y', label: 'Position Y', type: 'range', min: -80, max: 80, step: 1, fmt: px },
      { group: 'Layout & quantity', key: 'rotation', label: 'Rotation', type: 'range', min: -180, max: 180, step: 1, fmt: deg },
      { group: 'Layout & quantity', key: 'count', type: 'range', fmt: String, ...count },
    ];

    if (ctrl === 'switch') p.push(
      { group: 'Interaction response', key: 'sensitivity', label: 'Drag sensitivity', type: 'range', min: 0.25, max: 3, step: 0.05, fmt: x, hint: 'Lever movement per pixel dragged' },
      { group: 'Interaction response', key: 'snap', label: 'Snap distance', type: 'range', min: 0, max: 20, step: 1, fmt: u, hint: 'Snaps ON when dragged this close to the top' },
      { group: 'Interaction response', key: 'threshold', label: 'Trigger threshold', type: 'range', min: 10, max: 100, step: 5, fmt: pct, hint: 'Released past this point = ON, else springs back' },
    );
    else p.push(
      { group: 'Interaction response', key: 'hold', label: 'Hold duration', type: 'range', min: 0, max: ctrl === 'button' ? 3000 : 1500, step: 50, fmt: ms,
        hint: ctrl === 'button' ? '0 = fires on press; otherwise press and hold' : '0 = fires on press; otherwise hold each key (typing is instant)' },
    );
    return p;
  }

  // ---------- Current settings (kept per browser when storage is available) ----------

  const clone = o => JSON.parse(JSON.stringify(o));
  let settings = clone(DEFAULTS);
  let open;
  try {
    const saved = JSON.parse(localStorage.getItem(STORE_KEY)) || {};
    for (const k in DEFAULTS) Object.assign(settings[k], saved[k] || {});
    open = saved._open;
  } catch (e) {}

  function save() {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(Object.assign({ _open: open }, settings))); } catch (e) {}
  }

  // ---------- Easing with bounce ----------

  function bezierAt(p, xv) {
    const [x1, y1, x2, y2] = p;
    const bx = t => 3 * x1 * t * (1 - t) ** 2 + 3 * x2 * t * t * (1 - t) + t ** 3;
    const by = t => 3 * y1 * t * (1 - t) ** 2 + 3 * y2 * t * t * (1 - t) + t ** 3;
    let lo = 0, hi = 1, t = xv;
    for (let i = 0; i < 30; i++) { t = (lo + hi) / 2; if (bx(t) < xv) lo = t; else hi = t; }
    return by(t);
  }
  const supportsLinear = !!(window.CSS && CSS.supports && CSS.supports('transition-timing-function', 'linear(0, 1)'));

  // Bounce adds an overshoot past the end position (up to ~40% of travel at 100%) that settles back
  function easingCss(ctrl, s, withBounce) {
    const pts = s.easing === 'study' ? STUDY_EASE[ctrl] : EASINGS[s.easing].pts;
    const bezier = `cubic-bezier(${pts.join(', ')})`;
    if (!withBounce || s.bounce <= 0 || !supportsLinear) return bezier;
    const b = s.bounce / 100, N = 60, out = [];
    for (let i = 0; i <= N; i++) {
      const e = bezierAt(pts, i / N), m = Math.min(Math.max(e, 0), 1);
      out.push((e + b * 1.33 * Math.sin(Math.PI * m) * m ** 3).toFixed(4));
    }
    return `linear(${out.join(', ')})`;
  }

  // ---------- Textures ----------

  const GRAIN_URI = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2'/%3E%3CfeColorMatrix values='0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 0.45 0'/%3E%3C/filter%3E%3Crect width='120' height='120' filter='url(%23n)'/%3E%3C/svg%3E\")";
  const CSS_TEXTURES = {
    none: 'none',
    brushed: 'repeating-linear-gradient(0deg, rgba(255,255,255,0.18) 0 1px, rgba(0,0,0,0.08) 1px 2px, transparent 2px 3px)',
    grain: GRAIN_URI,
    stripes: 'repeating-linear-gradient(45deg, rgba(0,0,0,0.3) 0 8px, transparent 8px 16px)',
    dots: 'radial-gradient(circle, rgba(0,0,0,0.25) 1.3px, transparent 1.8px) 0 0 / 7px 7px',
  };

  // ---------- Apply settings to the page ----------

  const root = document.documentElement;
  const $ = id => document.getElementById(id);
  const setVar = (k, v) => root.style.setProperty(k, v);

  function applyAnimation(ctrl, pfx) {
    const s = settings[ctrl];
    setVar(`--${pfx}-dur`, `${Math.round(s.duration / s.speed)}ms`);
    setVar(`--${pfx}-ease`, easingCss(ctrl, s, true));
    setVar(`--${pfx}-ease-base`, easingCss(ctrl, s, false));
    setVar(`--${pfx}-travel`, String(s.travel));
  }

  // Position and rotation move the whole control within its module
  function place(el, s) {
    el.style.translate = `${s.x}px ${s.y}px`;
    el.style.rotate = `${s.rotation}deg`;
  }

  function applySwitch() {
    const s = settings.switch;
    applyAnimation('switch', 'sw');
    const sw = $('sw'), plate = $('swPlate'), tex = $('swTexture');
    plate.setAttribute('fill', s.fill);
    plate.setAttribute('stroke-width', s.stroke);
    plate.setAttribute('rx', s.radius);
    tex.setAttribute('rx', s.radius);
    tex.setAttribute('fill', s.texture === 'none' ? 'none' : `url(#tex-${s.texture})`);
    sw.classList.toggle('asset-mode', s.asset === 'file');
    sw.style.opacity = s.opacity / 100;
    sw.style.filter = s.shadow > 0 ? `drop-shadow(0 ${s.shadow * 0.06}px ${s.shadow * 0.1}px rgba(0,0,0,${Math.min(0.6, s.shadow * 0.0035)}))` : '';
    place(sw, s);
    $('modSwitch').style.gap = `${s.spacing}px`;

    // Grip lines, evenly spaced around the lever's middle
    const grip = $('swGrip');
    grip.innerHTML = '';
    for (let i = 0; i < s.count; i++) {
      const y = 107 + (i - (s.count - 1) / 2) * 6;
      const l = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      l.setAttribute('class', 'grip');
      for (const [k, v] of Object.entries({ x1: 90, y1: y, x2: 110, y2: y })) l.setAttribute(k, v);
      grip.appendChild(l);
    }
  }

  function applyKeypad() {
    const s = settings.keypad;
    applyAnimation('keypad', 'kp');
    const pad = $('pad');
    setVar('--kp-fill', s.fill);
    setVar('--kp-stroke', String(s.stroke));
    setVar('--kp-hold', `${s.hold}ms`);
    pad.querySelectorAll('.key .base, .key .cap, .lamp rect').forEach(r => r.setAttribute('rx', s.radius));
    $('kpTexture').setAttribute('fill', s.texture === 'none' ? 'none' : `url(#tex-${s.texture})`);
    pad.classList.toggle('asset-mode', s.asset === 'file');
    pad.style.opacity = s.opacity / 100;
    pad.style.filter = s.shadow > 0 ? `drop-shadow(0 ${s.shadow * 0.06}px ${s.shadow * 0.1}px rgba(0,0,0,${Math.min(0.6, s.shadow * 0.0035)}))` : '';
    place(pad, s);
    $('modKeypad').style.gap = `${s.spacing}px`;
  }

  function applyButton() {
    const s = settings.button;
    applyAnimation('button', 'btn');
    // Only override the themed button color once it differs from the default
    if (s.fill.toLowerCase() !== DEFAULTS.button.fill) {
      setVar('--btn', s.fill);
      setVar('--btn-hover', `color-mix(in srgb, ${s.fill}, white 12%)`);
    } else {
      root.style.removeProperty('--btn');
      root.style.removeProperty('--btn-hover');
    }
    const isAsset = s.asset === 'file';
    // Absolute URL: a url() inside a custom property resolves against the stylesheet that uses it
    const assetUrl = new URL(ASSETS.button.file, document.baseURI).href;
    setVar('--btn-tex', isAsset ? `url("${assetUrl}") center / contain no-repeat` : CSS_TEXTURES[s.texture]);
    setVar('--btn-stroke', `${s.stroke}px`);
    setVar('--btn-radius', `${s.radius}%`);
    setVar('--btn-shadow', String(s.shadow / 100));
    setVar('--btn-check-dur', `${Math.round(300 / s.speed)}ms`);
    setVar('--btn-check-delay', `${Math.round(80 / s.speed)}ms`);
    const btn = $('defuse'), housing = btn.parentElement;
    btn.classList.toggle('asset-mode', isAsset);
    housing.style.opacity = s.opacity / 100;
    place(housing, s);
    $('modButton').style.gap = `${s.spacing}px`;

    housing.querySelectorAll('.ring').forEach(r => r.remove());
    for (let i = 0; i < s.count; i++) {
      const r = document.createElement('span');
      r.className = 'ring';
      r.style.setProperty('--ring', `${176 + i * 14}px`);
      housing.prepend(r);
    }
  }

  const APPLY = { switch: applySwitch, keypad: applyKeypad, button: applyButton };
  function applyAll() { for (const k in APPLY) APPLY[k](); }

  // Read by main.js
  window.Anim = {
    get: (ctrl, key) => settings[ctrl][key],
    delay: ctrl => Math.round(settings[ctrl].delay / settings[ctrl].speed),
    // main.js rebuilds keypad markup at round start, then re-applies visuals
    refresh: () => applyAll(),
  };

  // ---------- Copy settings ----------

  const INSTRUCTION = 'Apply these values as the prototype’s saved defaults. Retain the panel code for later adjustments. Commit and push the changes.';

  function settingsText() {
    const lines = ['Defuse the Bomb: control panel settings', ''];
    for (const ctrl of Object.keys(DEFAULTS)) {
      lines.push(`${LABELS[ctrl].toUpperCase()} (${ctrl})`);
      let group = '';
      for (const p of paramsFor(ctrl)) {
        if (p.group !== group) { group = p.group; lines.push(`  ${group}`); }
        const v = settings[ctrl][p.key];
        const shown = p.type === 'select' ? `${p.options[v]} [${v}]` : p.fmt ? p.fmt(v) : v;
        lines.push(`    ${p.label}: ${shown}   (${p.key} = ${JSON.stringify(v)})`);
      }
      lines.push('');
    }
    lines.push(INSTRUCTION);
    return lines.join('\n');
  }

  async function copyText(text) {
    try { await navigator.clipboard.writeText(text); return true; } catch (e) {}
    try {
      const ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      const ok = document.execCommand('copy');
      ta.remove();
      return ok;
    } catch (e) { return false; }
  }

  // ---------- Panel UI ----------

  function build() {
    const panel = $('animPanel');
    if (open === undefined) open = window.matchMedia('(min-width: 1100px)').matches;

    panel.innerHTML = `
      <button class="ap-toggle" id="apToggle" aria-expanded="false" aria-controls="apBody">
        <span class="ap-title">CONTROLS</span><span class="ap-chev" aria-hidden="true"></span>
      </button>
      <div class="ap-body" id="apBody">
        <div class="ap-tabs" role="tablist" aria-label="Component"></div>
        <div class="ap-fields"></div>
        <div class="ap-actions">
          <button class="ap-btn" id="apRestore">RESTORE DEFAULTS</button>
          <button class="ap-btn" id="apCopy">COPY SETTINGS</button>
          <button class="ap-btn" id="apRestart">RESTART ROUND</button>
        </div>
        <p class="ap-note" id="apNote" aria-live="polite"></p>
        <textarea class="ap-copybox" id="apCopyBox" readonly hidden aria-label="Settings to copy"></textarea>
      </div>`;

    const toggle = $('apToggle'), body = $('apBody');
    const tabs = panel.querySelector('.ap-tabs'), fields = panel.querySelector('.ap-fields');
    const note = $('apNote'), copyBox = $('apCopyBox');
    let current = 'switch';
    const openGroups = { 'Animation': true };

    function setOpen(v) {
      open = v;
      panel.classList.toggle('open', v);
      toggle.setAttribute('aria-expanded', String(v));
      body.hidden = !v;
      document.body.classList.toggle('panel-open', v);
      save();
    }
    toggle.addEventListener('click', () => setOpen(!open));

    for (const k of Object.keys(DEFAULTS)) {
      const t = document.createElement('button');
      t.className = 'ap-tab'; t.textContent = LABELS[k].toUpperCase();
      t.setAttribute('role', 'tab'); t.dataset.ctrl = k;
      t.addEventListener('click', () => { current = k; render(); });
      tabs.appendChild(t);
    }

    function field(p, container) {
      const s = settings[current], id = `ap-${current}-${p.key}`;
      const row = document.createElement('div');
      row.className = 'ap-row';
      const label = `<div class="ap-label"><label for="${id}">${p.label}</label><output id="${id}-out"></output></div>`;
      const hint = p.hint ? `<div class="ap-hint">${p.hint}</div>` : '';
      if (p.type === 'range') {
        row.innerHTML = `${label}<input type="range" id="${id}" min="${p.min}" max="${p.max}" step="${p.step}" value="${s[p.key]}">${hint}`;
      } else if (p.type === 'color') {
        row.innerHTML = `${label}<input type="color" id="${id}" value="${s[p.key]}">${hint}`;
      } else {
        const opts = Object.entries(p.options).map(([k, v]) => `<option value="${k}"${k === s[p.key] ? ' selected' : ''}>${v}</option>`).join('');
        row.innerHTML = `${label}<select id="${id}">${opts}</select>${hint}`;
      }
      const input = row.querySelector('input, select'), out = row.querySelector('output');
      const show = () => { out.textContent = p.type === 'range' ? p.fmt(s[p.key]) : p.type === 'color' ? s[p.key] : ''; };
      show();
      input.addEventListener(p.type === 'select' ? 'change' : 'input', () => {
        s[p.key] = p.type === 'range' ? Number(input.value) : input.value;
        show(); APPLY[current](); save();
      });
      container.appendChild(row);
    }

    function render() {
      tabs.querySelectorAll('.ap-tab').forEach(t => t.setAttribute('aria-selected', String(t.dataset.ctrl === current)));
      fields.innerHTML = '';
      let details = null;
      for (const p of paramsFor(current)) {
        if (!details || details.dataset.group !== p.group) {
          details = document.createElement('details');
          details.className = 'ap-group'; details.dataset.group = p.group;
          details.open = !!openGroups[p.group];
          details.innerHTML = `<summary>${p.group.toUpperCase()}</summary>`;
          const g = p.group;
          details.addEventListener('toggle', () => { openGroups[g] = details.open; });
          fields.appendChild(details);
        }
        field(p, details);
      }
    }

    $('apRestore').addEventListener('click', () => {
      settings = clone(DEFAULTS);
      applyAll(); save(); render();
      note.textContent = 'All components restored to the saved defaults.';
      copyBox.hidden = true;
    });

    $('apCopy').addEventListener('click', async () => {
      const text = settingsText();
      if (await copyText(text)) {
        note.textContent = 'Settings copied to the clipboard.';
        copyBox.hidden = true;
      } else {
        // Clipboard blocked (e.g. inside an embedded preview): show the text to copy by hand
        note.textContent = 'Copy blocked here. Select the text below and copy it.';
        copyBox.value = text; copyBox.hidden = false; copyBox.focus(); copyBox.select();
      }
    });

    $('apRestart').addEventListener('click', () => document.dispatchEvent(new CustomEvent('anim:restart')));

    render();
    setOpen(open);
  }

  applyAll();
  build();
})();
