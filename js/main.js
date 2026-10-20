// Defuse the Bomb: one linear sequence built from the three studies.
//   Step 1  Switch  (studies/flip-the-switch)  -> opens the panel, reveals the code
//   Step 2  Keypad  (studies/enter-the-code)   -> enter the revealed code
//   Step 3  Button  (studies/press-me-button)  -> press DEFUSE
// Each step unlocks only after the previous one succeeds. A 60s countdown runs
// from page load; reaching zero detonates. RESTART appears at either ending.
// Timing, travel, hold and drag settings come from the control panel (js/controls.js, window.Anim).
(function () {
  const DURATION = 60000;      // countdown length, ms
  const URGENT_AT = 10;        // seconds left when ticking speeds up in pitch
  const NS = 'http://www.w3.org/2000/svg';

  const $ = (id) => document.getElementById(id);
  const device = $('device');
  const timerEl = $('timer');
  const armedLight = $('armedLight');
  const armedLabel = $('armedLabel');
  const statusEl = $('status');
  const restartBtn = $('restart');
  const flash = $('flash');
  const modules = [$('modSwitch'), $('modKeypad'), $('modButton')];

  // ---------- Sequence state ----------

  let phase = 'armed';         // 'armed' | 'defused' | 'exploded'
  let step = 1;                // the one step currently available
  let code = '';               // random 4-digit disarm code for this round
  let deadline = 0;
  let lastSecond = null;

  // Every delayed action goes through later() so restart/detonation can cancel it
  const pending = new Set();
  function later(fn, ms) {
    const id = setTimeout(() => { pending.delete(id); fn(); }, ms);
    pending.add(id);
  }
  function cancelPending() { pending.forEach(clearTimeout); pending.clear(); }

  const INSTRUCTIONS = {
    1: 'FLIP THE SWITCH TO OPEN THE ACCESS PANEL',
    2: 'ENTER THE DISARM CODE',
    3: 'PRESS DEFUSE',
  };

  // Lock every module except the current step; earlier steps stay in their finished state
  function setStep(n) {
    step = n;
    modules.forEach((m, i) => {
      const s = i + 1;
      m.classList.toggle('locked', s > n);
      m.classList.toggle('active', s === n);
      m.classList.toggle('done', s < n);
      m.inert = s !== n;
    });
    statusEl.textContent = INSTRUCTIONS[n];
  }

  function focusStep(n) {
    const target = n === 1 ? sw : n === 2 ? keyEls['1'] : defuseBtn;
    target.focus({ preventScroll: true });
    const r = modules[n - 1].getBoundingClientRect();
    if (r.top < 0 || r.bottom > window.innerHeight) {
      modules[n - 1].scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'center' });
    }
  }

  // ---------- Countdown ----------

  const fmt = (sec) => '00:' + String(sec).padStart(2, '0');
  const fmtFull = (sec) => String(Math.floor(sec / 60)).padStart(2, '0') + ':' + String(sec % 60).padStart(2, '0');

  function updateTimer() {
    if (phase !== 'armed') return;
    const left = deadline - performance.now();
    if (left <= 0) { detonate(); return; }
    const sec = Math.min(DURATION / 1000, Math.ceil(left / 1000));
    if (sec !== lastSecond) {
      if (lastSecond !== null) {
        Sfx.tick(sec <= URGENT_AT);
        armedLight.classList.add('blink');
        setTimeout(() => armedLight.classList.remove('blink'), 180);
      }
      lastSecond = sec;
      timerEl.textContent = sec >= 60 ? fmtFull(sec) : fmt(sec);
      timerEl.classList.toggle('urgent', sec <= URGENT_AT);
    }
  }
  setInterval(updateTimer, 50);

  // ---------- Step 1: switch ----------

  const sw = $('sw');
  const swLight = $('swLight');
  const lblOn = $('lblOn');
  const lblOff = $('lblOff');
  const codeReadout = $('codeReadout');
  const codeValue = $('codeValue');

  function setSwitch(on) {
    sw.classList.toggle('on', on);
    sw.setAttribute('aria-checked', String(on));
    sw.setAttribute('aria-label', on ? 'Access panel switch, on' : 'Access panel switch, off');
    lblOn.classList.toggle('dim', !on);
    lblOff.classList.toggle('dim', on);
  }

  function flipOn() {
    if (phase !== 'armed' || step !== 1 || sw.classList.contains('on')) return;
    setSwitch(true);
    Sfx.clack(1500);
    // Light and code follow the lever landing (panel: Switch > Delay, study 180ms)
    later(() => {
      swLight.classList.add('on');
      codeValue.textContent = code;
      codeReadout.classList.add('revealed');
      setStep(2);
      focusStep(2);
    }, Anim.delay('switch'));
  }

  // Clicking flips the switch; dragging the lever up also works
  // (panel: Switch > Drag sensitivity, Snap distance, Trigger threshold)
  const lever = sw.querySelector('.lever');
  let drag = null, suppressClick = false;

  function endDrag() {
    lever.style.transition = '';
    lever.style.transform = '';
    drag = null;
  }
  function suppressNextClick() { suppressClick = true; setTimeout(() => { suppressClick = false; }, 0); }

  sw.addEventListener('click', () => { if (!suppressClick) flipOn(); });

  sw.addEventListener('pointerdown', (e) => {
    if (phase !== 'armed' || step !== 1 || sw.classList.contains('on') || e.button !== 0) return;
    drag = { x: e.clientX, y: e.clientY, off: 0, moved: false };
    sw.setPointerCapture(e.pointerId);
  });

  sw.addEventListener('pointermove', (e) => {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) < 4) return;
    drag.moved = true;
    // Distance moved along the lever's "up" direction, allowing for panel rotation
    const a = Anim.get('switch', 'rotation') * Math.PI / 180;
    const up = dx * Math.sin(a) - dy * Math.cos(a);
    const travel = Anim.get('switch', 'travel');
    const units = up * (200 / sw.offsetWidth) * Anim.get('switch', 'sensitivity');
    drag.off = Math.min(Math.max(units, 0), travel);
    lever.style.transition = 'none';
    lever.style.transform = `translateY(${-drag.off}px)`;
    if (travel - drag.off <= Anim.get('switch', 'snap')) {
      endDrag(); suppressNextClick(); flipOn();
    }
  });

  function releaseDrag(cancelled) {
    if (!drag) return;
    const { moved, off } = drag;
    endDrag();
    if (!moved) return;                       // a plain click; the click handler flips it
    suppressNextClick();
    const travel = Anim.get('switch', 'travel');
    if (!cancelled && off >= travel * Anim.get('switch', 'threshold') / 100) flipOn();
    // otherwise the lever springs back to OFF through its normal transition
  }
  sw.addEventListener('pointerup', () => releaseDrag(false));
  sw.addEventListener('pointercancel', () => releaseDrag(true));

  // ---------- Step 2: keypad ----------

  const kpDisplay = $('kpDisplay');
  const kpKeys = $('kpKeys');
  const kpMessage = $('kpMessage');
  let entered = '', kpLocked = false;

  const el = (tag, attrs, parent) => {
    const n = document.createElementNS(NS, tag);
    for (const k in attrs) n.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(n);
    return n;
  };

  // Display slots, one per code digit (panel: Keypad > Code length; study: 4)
  let codeLength = 4;
  let slots = [], digits = [];
  function buildSlots(n) {
    codeLength = n;
    slots.concat(digits).forEach(e => e.remove());
    slots = []; digits = [];
    const gap = 4, w = Math.min(28, (128 - gap * (n - 1)) / n);
    const start = 120 - (n * w + (n - 1) * gap) / 2;
    for (let i = 0; i < n; i++) {
      const x = start + i * (w + gap);
      slots.push(el('rect', { class: 'slot', x, y: 36, width: w, height: 32, rx: 3 }, kpDisplay));
      digits.push(el('text', { class: 'digit', x: x + w / 2, y: 61, style: `font-size:${Math.min(26, w)}px` }, kpDisplay));
    }
  }

  const LAYOUT = ['1','2','3','4','5','6','7','8','9','CLEAR','0','LAMP'];
  const keyEls = {};
  let lamp;
  LAYOUT.forEach((v, i) => {
    const x = [49, 98, 147][i % 3], y = [94, 141, 188, 235][Math.floor(i / 3)];
    if (v === 'LAMP') {
      lamp = el('g', { class: 'lamp', 'aria-hidden': 'true' }, kpKeys);
      el('rect', { x, y: y + 3, width: 43, height: 40, rx: 5 }, lamp);
      el('path', { d: `M${x+12} ${y+24} L${x+19} ${y+31} L${x+32} ${y+15}` }, lamp);
      return;
    }
    const g = el('g', { class: 'key', tabindex: 0, role: 'button', 'aria-label': v === 'CLEAR' ? 'Clear' : v }, kpKeys);
    el('rect', { class: 'base', x, y: y + 3, width: 43, height: 40, rx: 5 }, g);
    const face = el('g', { class: 'face' }, g);
    el('rect', { class: 'cap', x, y, width: 43, height: 40, rx: 5 }, face);
    const t = el('text', { class: 'lbl' + (v === 'CLEAR' ? ' small' : ''), x: x + 21.5, y: v === 'CLEAR' ? y + 24 : y + 26 }, face);
    t.textContent = v;
    keyEls[v] = g;

    // With a hold duration set (panel: Keypad > Hold duration), a key registers
    // only after being held that long; otherwise it fires on click as in the study
    let holdTimer = null;
    const press = () => {
      if (g.classList.contains('off')) return;
      g.classList.add('down');
      const hold = Anim.get('keypad', 'hold');
      if (hold > 0) {
        g.classList.add('holding');
        holdTimer = setTimeout(() => { holdTimer = null; g.classList.remove('holding'); activate(v); }, hold);
      }
    };
    const release = () => {
      g.classList.remove('down', 'holding');
      if (holdTimer) { clearTimeout(holdTimer); holdTimer = null; }
    };
    g.addEventListener('pointerdown', press);
    ['pointerup', 'pointerleave', 'pointercancel'].forEach(e => g.addEventListener(e, release));
    g.addEventListener('click', () => { if (Anim.get('keypad', 'hold') <= 0) activate(v); });
    g.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); tap(v); }
    });
  });

  // Animated press for keyboard input, then act
  function tap(v) {
    const g = keyEls[v];
    if (!g || g.classList.contains('off')) return;
    g.classList.add('down');
    setTimeout(() => g.classList.remove('down'), 110);
    activate(v);
  }

  function render(popIndex) {
    for (let i = 0; i < codeLength; i++) {
      digits[i].textContent = entered[i] || '';
      slots[i].classList.toggle('next', !kpLocked && i === entered.length);
    }
    if (popIndex != null) {
      const d = digits[popIndex];
      d.classList.remove('pop'); void d.getBBox(); d.classList.add('pop');
    }
  }

  function setKeys(enabled) {
    Object.values(keyEls).forEach(g => {
      g.classList.toggle('off', !enabled);
      g.setAttribute('aria-disabled', String(!enabled));
    });
  }

  function activate(v) {
    if (phase !== 'armed' || step !== 2 || kpLocked) return;
    Sfx.key();
    if (v === 'CLEAR') { entered = ''; kpMessage.innerHTML = '&nbsp;'; render(); return; }
    if (entered.length >= codeLength) return;
    entered += v;
    kpMessage.innerHTML = '&nbsp;';
    render(entered.length - 1);
    // Lock input while checking so CLEAR can't empty the entry mid-check
    if (entered.length === codeLength) { kpLocked = true; later(check, Anim.delay('keypad')); }
  }

  function check() {
    kpLocked = true;
    setKeys(false);
    if (entered === code) {
      kpDisplay.classList.add('right');
      lamp.classList.add('lit');
      kpMessage.textContent = '✓ CODE ACCEPTED';
      Sfx.accept();
      render();
      later(() => { setStep(3); focusStep(3); }, 250);
    } else {
      kpDisplay.classList.add('wrong', 'shake');
      kpMessage.textContent = 'INCORRECT CODE';
      Sfx.buzz();
      render();
      later(() => {
        kpDisplay.classList.remove('wrong', 'shake');
        entered = ''; kpLocked = false;
        setKeys(true);
        kpMessage.innerHTML = '&nbsp;';
        render();
        if (step === 2) keyEls['1'].focus({ preventScroll: true });
      }, 1100);
    }
  }

  // Typing digits anywhere presses the matching key, but only during step 2
  document.addEventListener('keydown', (e) => {
    if (phase !== 'armed' || step !== 2) return;
    // Keys handle Enter/Space themselves; ignore typing in buttons and panel fields
    if (e.target.closest && e.target.closest('button, input, select, textarea')) return;
    if (/^[0-9]$/.test(e.key)) tap(e.key);
    else if (e.key === 'Backspace' || e.key === 'Escape') tap('CLEAR');
  });

  function resetKeypad() {
    entered = ''; kpLocked = false;
    kpDisplay.classList.remove('wrong', 'right', 'shake');
    lamp.classList.remove('lit');
    kpMessage.innerHTML = '&nbsp;';
    setKeys(true);
    render();
  }

  // ---------- Step 3: DEFUSE button ----------

  const defuseBtn = $('defuse');

  // With a hold duration set (panel: Button > Hold duration), DEFUSE must be
  // held while a ring fills; otherwise it fires on click as in the study
  const holdRing = $('holdRing'), holdCircle = holdRing.querySelector('circle');
  let holdStart = null, holdFrame = null;

  function startHold() {
    const hold = Anim.get('button', 'hold');
    if (hold <= 0 || holdStart !== null || phase !== 'armed' || step !== 3 || defuseBtn.classList.contains('on')) return;
    holdStart = performance.now();
    defuseBtn.classList.add('holding');
    holdRing.classList.add('active');
    const tick = () => {
      const p = Math.min(1, (performance.now() - holdStart) / hold);
      holdCircle.style.strokeDashoffset = String(100 - p * 100);
      if (p >= 1) { stopHold(); defuse(); return; }
      holdFrame = requestAnimationFrame(tick);
    };
    tick();
  }
  function stopHold() {
    if (holdFrame) cancelAnimationFrame(holdFrame);
    holdStart = holdFrame = null;
    defuseBtn.classList.remove('holding');
    holdRing.classList.remove('active');
    holdCircle.style.strokeDashoffset = '';
  }
  defuseBtn.addEventListener('pointerdown', (e) => { if (e.button === 0) startHold(); });
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(e => defuseBtn.addEventListener(e, stopHold));
  defuseBtn.addEventListener('keydown', (e) => { if ((e.key === ' ' || e.key === 'Enter') && !e.repeat) startHold(); });
  defuseBtn.addEventListener('keyup', (e) => { if (e.key === ' ' || e.key === 'Enter') stopHold(); });
  defuseBtn.addEventListener('blur', stopHold);

  defuseBtn.addEventListener('click', () => { if (Anim.get('button', 'hold') <= 0) defuse(); });

  function defuse() {
    if (phase !== 'armed' || step !== 3 || defuseBtn.classList.contains('on')) return;
    const left = Math.max(0, deadline - performance.now());
    phase = 'defused';                       // timer freezes on the press
    defuseBtn.classList.add('on');
    defuseBtn.setAttribute('aria-pressed', 'true');
    defuseBtn.setAttribute('aria-label', 'Defused');
    Sfx.thunk();
    later(() => {
      modules[2].classList.add('done');
      modules[2].classList.remove('active');
      device.classList.add('defused');
      armedLabel.textContent = 'SAFE';
      const secs = Math.ceil(left / 1000);    // matches the frozen timer
      statusEl.textContent = `BOMB DEFUSED · ${secs} SECOND${secs === 1 ? "" : "S"} LEFT`;
      Sfx.chime();
      showRestart();
    }, Anim.delay('button'));
  }

  // ---------- Endings ----------

  function detonate() {
    phase = 'exploded';
    cancelPending();
    stopHold();
    endDrag();
    modules.forEach(m => { m.inert = true; });
    timerEl.textContent = '00:00';
    timerEl.classList.remove('urgent');
    armedLabel.textContent = 'BOOM';
    statusEl.textContent = 'DETONATED';
    device.classList.add('exploded');
    flash.classList.remove('boom'); void flash.offsetWidth; flash.classList.add('boom');
    Sfx.explosion();
    later(showRestart, 900);
  }

  function showRestart() {
    restartBtn.hidden = false;
    restartBtn.focus({ preventScroll: true });
  }

  // ---------- Round setup ----------

  function newRound() {
    cancelPending();
    phase = 'armed';
    buildSlots(Anim.get('keypad', 'count'));
    code = Array.from({ length: codeLength }, () => Math.floor(Math.random() * 10)).join('');

    device.classList.remove('defused', 'exploded');
    flash.classList.remove('boom');
    armedLabel.textContent = 'ARMED';
    restartBtn.hidden = true;

    setSwitch(false);
    swLight.classList.remove('on');
    codeReadout.classList.remove('revealed');
    codeValue.textContent = Array(codeLength).fill('-').join(' ');
    codeValue.style.fontSize = codeLength > 4 ? `${1.7 * 4 / codeLength + 0.3}rem` : '';

    resetKeypad();

    defuseBtn.classList.remove('on');
    defuseBtn.setAttribute('aria-pressed', 'false');
    defuseBtn.removeAttribute('aria-label');

    stopHold();
    endDrag();
    Anim.refresh();                          // re-apply panel visuals to rebuilt keypad parts

    setStep(1);
    deadline = performance.now() + DURATION;
    lastSecond = null;
    updateTimer();
  }

  function restart() {
    Sfx.clack(900);                          // the switch study's reset clack
    newRound();
    focusStep(1);
  }
  restartBtn.addEventListener('click', restart);
  document.addEventListener('anim:restart', restart);   // panel: RESTART ROUND

  // Sound can only start after the first user gesture
  ['pointerdown', 'keydown'].forEach(e => document.addEventListener(e, Sfx.unlock, { capture: true }));

  newRound();
})();
