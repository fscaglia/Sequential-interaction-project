# Study: Press Me Button

## What the study does

It explores a single physical-feeling push button. The user presses a large round
button and it **latches down**: it stays depressed, turns darker, and shows a
check mark. A status light and a status message confirm the change. A small
**RESET** control pops the button back up so the interaction can be repeated.

It is a one-step, two-state study (READY → ACTIVATED) and can serve as one stage
of a larger sequential prototype.

## Main visual and interactive components

| Component | Element | Role |
| --- | --- | --- |
| Panel | `<main class="panel" id="panel">` | Centered card (max 360px wide) holding everything. Gets the `.done` class when activated. |
| Status light | `<span class="light">` | 14px dot. Hollow = waiting, filled = done. |
| Housing | `<div class="housing">` | 232px recessed square well (inset shadow) the button sits in. |
| Press button | `<button id="press">` | 176px round button labeled **PRESS ME**, raised with a solid "edge" shadow. Contains a hidden check-mark SVG. |
| Message | `<p id="message" aria-live="polite">` | Status text: `READY` / `BUTTON ACTIVATED`. Announced by screen readers. |
| Reset | `<button id="reset">` | Small outlined button with a circular-arrow icon. Disabled until the button is activated. |

Visual style is monochrome grey with IBM Plex Mono uppercase, letter-spaced text.
Colors are CSS custom properties with a light palette and a dark palette (follows
the OS setting, or forced with `data-theme="light"`/`"dark"` on `<html>`).

## User actions, feedback, states and transitions

### States

| State | Press button | Light | Message | Reset |
| --- | --- | --- | --- | --- |
| **READY** (initial) | Raised (`translateY(-6px)`, 12px edge shadow), mid grey, "PRESS ME", `aria-pressed="false"` | Hollow | `READY` (muted color) | Disabled (35% opacity) |
| **ACTIVATED** | Latched down (`translateY(6px)`), dark grey, inset shadow, check mark instead of label, `aria-pressed="true"`, `aria-label="Button activated"`, default cursor | Filled | `BUTTON ACTIVATED` (full ink color) | Enabled |

### Actions and feedback

1. **Hover** the press button (READY): background lightens (`--btn-hover`).
2. **Mouse/touch down** (`:active`): button sinks to `translateY(4px)` and its edge
   shadow shrinks, a 90ms "physical" travel.
3. **Click / Enter / Space** on the press button → **READY → ACTIVATED**:
   - `.on` is added to the button and `.done` to the panel.
   - Button settles fully down and darkens (90ms transform/shadow, 150ms color).
   - The "PRESS ME" label is replaced by a check mark that **draws itself**
     (stroke-dashoffset animation, 0.3s with 0.08s delay).
   - Light fills (150ms), message changes to `BUTTON ACTIVATED`, Reset enables.
4. **Clicking the press button again** while ACTIVATED does nothing (guarded in JS).
5. **Click RESET** → **ACTIVATED → READY**: all classes and ARIA attributes are
   removed/restored, message returns to `READY`, Reset disables, and keyboard focus
   moves back to the press button.

### Accessibility details

- Both controls are native `<button>`s, so keyboard and screen readers work by default.
- Dashed focus outlines on `:focus-visible`.
- `aria-pressed` reflects the latch state; the message is a polite live region.
- `prefers-reduced-motion: reduce` removes transitions and shows the check mark
  without the draw animation.

## Where it's implemented (`index.html`)

| Concern | Lines |
| --- | --- |
| Google Fonts link (IBM Plex Mono) | 7 |
| Host base styles (safe-area padding etc.) | 9–14 |
| Color tokens (light) and font stack | 16–30 |
| Dark-mode tokens (OS preference / `data-theme`) | 31–44 |
| Page layout (`body`, `.panel`) | 45–58 |
| Status light, incl. `.done` filled state | 59–66 |
| Housing well | 67–73 |
| Press button: raised base, hover, active (pressed travel), focus | 75–89 |
| Press button activated state (`#press.on`) | 91–97 |
| Check mark show/hide + draw animation | 98–104 |
| Message styles, incl. `.done` color | 106–112 |
| Reset button styles, incl. disabled/focus | 113–124 |
| Reduced-motion overrides | 126–129 |
| Markup: panel, light, housing, press button, message, reset | 134–150 |
| JS: element lookups | 152–157 |
| JS: press handler (READY → ACTIVATED) | 158–166 |
| JS: reset handler (ACTIVATED → READY) | 168–176 |

All state lives in the DOM: the `.on` class on `#press` and the `.done` class
on `#panel`. There's no other JS state, so a parent prototype can read or drive
the step by toggling those classes or by calling `press.click()` / `reset.click()`.

## External dependencies and assets

- **Google Fonts: IBM Plex Mono 500/600**
  (`https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@500;600&display=swap`).
  Optional; falls back to the system monospace font offline.
- **No** JS libraries, frameworks, build tools or package manager.
- **No** image files. The check mark and reset arrow are inline SVG in the markup.
- Runs in any modern browser by opening `index.html` directly.

## Notes for integrating into a sequential prototype

- The step currently has no "completed" event. To chain it, dispatch a custom event
  (e.g. `panel.dispatchEvent(new CustomEvent('step:complete'))`) at the end of the
  press handler, or observe the `.done` class.
- To lock the step until an earlier one finishes, set `press.disabled = true`; the
  hover and active styles already exclude `:disabled`.
- IDs (`panel`, `press`, `message`, `reset`) and top-level `const` names are generic.
  Namespace them (e.g. `pressPanel`) if they will share a page with other studies.
