# Study: Flip the Switch

## What the study does

It explores a physical wall-style toggle switch. The user flips the switch up
from **OFF** to **ON**. The lever springs into place with a mechanical "clack"
sound, then an indicator light glows and a status message confirms the change.
The switch stays on; a **RESET** button flips it back off so the interaction can
be repeated.

It is a one-step, two-state study (OFF → ON) and can serve as one stage of a
larger sequential prototype.

## Main visual and interactive components

| Component | Element | Role |
| --- | --- | --- |
| Indicator light | `<div class="light" id="light">` | 34px round lens above the switch. Dark when off, bright white with a glow when on. |
| Switch | `<button id="sw" role="switch">` | The whole inline SVG is the clickable control, up to 300px wide (72% of the viewport on small screens). |
| Switch plate | SVG `<rect>`, two screw `<circle>`s | Grey rounded plate with a dark outline. |
| ON / OFF labels | SVG `<text id="lblOn">`, `<text id="lblOff">` | The active position's label is bold and dark; the other is dimmed. |
| Slot | SVG `<rect>` | Dark channel the lever travels in. |
| Lever | SVG `<g class="lever">` | Light grey knob with three grip lines. Sits low (OFF) and slides up 34 units (ON). |
| Status message | `<p id="status" aria-live="polite">` | Empty at first, then `SWITCH ACTIVATED`. Announced by screen readers. |
| Reset | `<button id="reset">` | Small outlined text button. Disabled until the switch is on. |
| Click sound | `clack()` function | ~35ms synthesized noise burst: higher pitch (1500 Hz) when flipping on, lower (900 Hz) on reset. |

The look is monochrome grey with Arial. Page colors are CSS custom properties
with a light and a dark palette (follows the OS setting, or forced with
`data-theme="light"`/`"dark"` on `<html>`). The switch artwork and light keep
fixed greys in both themes.

## User actions, feedback, states and transitions

### States

| State | Lever | Labels | Light | Message | Reset | ARIA |
| --- | --- | --- | --- | --- | --- | --- |
| **OFF** (initial) | Lower position | OFF bold, ON dim | Dark lens | Blank | Disabled (35% opacity) | `aria-checked="false"`, label "Switch, off" |
| **ON** | Raised 34 units | ON bold, OFF dim | Bright with glow | `SWITCH ACTIVATED` | Enabled | `aria-checked="true"`, label "Switch, on" |

### Actions and feedback

1. **Hover** the switch (OFF): the lever lightens and nudges up 3 units toward ON.
2. **Mouse/touch down** (`:active`): the lever pushes up 6 units, quickly (60ms).
3. **Click / Enter / Space** on the switch → **OFF → ON**:
   - Immediately: `.on` is added, the lever springs up with a slight overshoot
     (0.28s, `cubic-bezier(.3,1.5,.5,1)`), the labels swap emphasis, ARIA updates,
     Reset enables, and the high "clack" plays.
   - After **180ms** (as the lever lands): the light turns on (0.15–0.2s fade) and
     the message changes to `SWITCH ACTIVATED`.
4. **Clicking the switch again** while ON does nothing (guarded in JS). The switch
   only goes back off through Reset.
5. **Click RESET** → **ON → OFF**: the lever drops back, labels and ARIA revert,
   the low "clack" plays, the light goes dark, the message clears, Reset
   disables, and keyboard focus moves back to the switch.

### Accessibility details

- The switch is a native `<button>` with `role="switch"`, so keyboard and screen
  readers work. `aria-checked` and `aria-label` reflect the state.
- Dashed focus outlines on `:focus-visible`.
- The status message is a polite live region.
- `prefers-reduced-motion: reduce` removes the lever, light and color transitions.

## Where it's implemented (`index.html`)

| Concern | Lines |
| --- | --- |
| Host base styles (safe-area padding etc.) | 8–13 |
| Color tokens and font, incl. dark mode | 15–26 |
| Page layout (`body`) | 28–34 |
| Indicator light, off and `.on` glow | 36–46 |
| Switch button, focus outline, plate label styles | 48–57 |
| Lever base position, spring transition, grip lines | 59–62 |
| Hover and active (pressed) lever nudge | 64–67 |
| ON state (`#sw.on`): lever raised 34 units | 69–70 |
| Status message styles | 72–75 |
| Reset button styles, incl. disabled/focus | 77–83 |
| Reduced-motion overrides | 85–87 |
| Markup: indicator light | 92 |
| Markup: switch button and SVG (plate, labels, slot, lever) | 94–112 |
| Markup: status message and reset | 114–115 |
| JS: element lookups and audio context | 118–124 |
| JS: `clack(pitch)` synthesized sound | 126–137 |
| JS: `setOn(on)`: switch, labels, ARIA, reset state | 139–146 |
| JS: switch click handler (OFF → ON, 180ms delayed light/message) | 148–157 |
| JS: reset handler (ON → OFF) | 159–165 |

State lives in the DOM: the `.on` class on `#sw` (set by `setOn`) and the
`.on` class on `#light`. A parent prototype can read those, or drive the step
with `sw.click()` / `reset.click()`.

## External dependencies and assets

- **None.** No web fonts, JS libraries, frameworks, build tools or package manager.
- **No** image or audio files. The switch is inline SVG (it matches the repo's
  `assets/switch.svg`, with the lever split out so it can move) and the sound is
  generated by the **Web Audio API** (`AudioContext`, with the `webkitAudioContext`
  fallback for older Safari). If audio is unavailable it fails silently.
- Runs in any modern browser by opening `index.html` directly, offline included.

## Notes for integrating into a sequential prototype

- The step has no "completed" event. To chain it, dispatch a custom event (e.g.
  `document.dispatchEvent(new CustomEvent('switch:on'))`) inside the 180ms
  timeout, so the next step starts when the light comes on.
- To lock the switch until an earlier step finishes, set `sw.disabled = true`.
  The hover and active styles don't exclude `:disabled`, so add `:not(:disabled)`
  to those selectors (lines 65–67) if the lever shouldn't react while locked.
- Known quirk: if Reset is clicked within 180ms of flipping on, the pending
  timeout still turns the light on and shows the message while the switch is
  off. Store the timeout ID and `clearTimeout` it in the reset handler to fix.
- IDs (`sw`, `light`, `status`, `reset`, `lblOn`, `lblOff`) and top-level names
  such as `reset`, `status` and `setOn` are generic. Namespace them if they will
  share a page with other studies (e.g. the Press Me Button study also uses
  `#reset`).
