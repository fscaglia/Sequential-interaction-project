# Sequential Interaction Project

**Defuse the Bomb**: a sequential interaction prototype built from three
interaction studies.

Live site (GitHub Pages, from `main` / root):
https://fscaglia.github.io/Sequential-interaction-project/

## The sequence

A bomb is armed and a 60-second countdown starts when the page loads. The
three controls sit on one panel and unlock one at a time:

1. **Access panel switch**: flip it ON. Its light comes on and a random
   4-digit disarm code is revealed.
2. **Keypad**: enter that code. A wrong code flashes, shakes and clears for
   another try; the right code lights the keypad's check lamp.
3. **DEFUSE button**: press it. It latches down with a check mark, the timer
   freezes and the bomb is defused.

If the timer reaches zero first, the bomb detonates. Either ending shows a
RESTART button, which starts a new round with a new code.

Sound (ticking, clicks, buzz, chime, explosion) is synthesized in the browser.
Browsers only allow audio after the first click or key press, so the countdown
is silent until then.

## Control panel

A floating, collapsible **CONTROLS** panel on the left tunes each component
(Switch, Keypad, Button) separately:

- **Animation:** speed, duration, delay (the pause before each step's
  feedback), easing, bounce, travel distance.
- **Appearance:** fill color, texture, SVG asset (swap in the static art from
  `assets/`), opacity, stroke width, corner radius, shadow.
- **Layout & quantity:** spacing, position, rotation, and a count (switch grip
  lines, keypad code length, button rings).
- **Interaction response:** drag sensitivity, snap distance and trigger
  threshold for dragging the switch lever; hold duration for keys and DEFUSE.

**Restore defaults** returns every component to the saved defaults (the
`DEFAULTS` object in `js/controls.js`, which reproduces the studies).
**Copy settings** copies all current values plus an instruction to make them
the new saved defaults. **Restart round** starts a new round at any time.
Your adjustments are remembered in this browser until you restore defaults.

## Files

| Path | What it is |
| --- | --- |
| `index.html` | The prototype page (markup for the panel and its three modules). |
| `css/style.css` | All styles: the device, lock/active/done states, each control, endings. |
| `js/main.js` | Sequence logic: countdown, step unlocking, switch (click or drag), keypad, button (click or hold), endings, restart. |
| `js/controls.js` | The control panel, its saved defaults, and how each setting is applied. |
| `js/audio.js` | Synthesized sound effects (Web Audio API). |
| `.nojekyll` | Tells GitHub Pages to serve the files as-is. |
| `studies/` | The original three studies, unchanged. Each has its own `STUDY.md`. |
| `assets/` | Static SVGs of the switch, keypad and button (used by the panel's SVG asset option) and a test image. |

There's no build step and no dependencies: open `index.html` in a browser, or
publish the repository root with GitHub Pages.

## How the studies map into the prototype

| Step | Study | Kept from the study | Adapted for the sequence |
| --- | --- | --- | --- |
| 1 | `studies/flip-the-switch` | SVG switch, lever spring and hover nudge, clack sound, indicator light following the lever after 180ms | Light also reveals the disarm code; no reset button |
| 2 | `studies/enter-the-code` | SVG keypad, key press animation, digit drop-in, wrong-code flash/shake/auto-clear, check lamp, keyboard typing | Random code per round; typing only works during this step; input locked while checking |
| 3 | `studies/press-me-button` | Raised button, press travel, latch-down, self-drawing check mark, status dot | Label reads DEFUSE; press freezes the timer; no reset button |
