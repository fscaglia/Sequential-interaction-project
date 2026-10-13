# Study: Enter the Code

## What the study does

It explores entering a 4-digit code on a physical-style keypad. The user taps
digits (or types them), which fill a 4-slot display. When the fourth digit goes
in, the code is checked:

- **Correct (`1234`):** the display turns light, a check-mark lamp lights up,
  `✓ CODE ACCEPTED` appears and the keypad locks.
- **Incorrect:** the display flashes white and shakes, `INCORRECT CODE` appears,
  and after about a second the entry clears so the user can try again.

A **RESET** button returns everything to the start. It is a one-step study with
a success and a failure path, and can serve as one stage of a larger sequential
prototype.

## Main visual and interactive components

| Component | Element | Role |
| --- | --- | --- |
| Instruction | `<p class="instruction">` | Static text `ENTER CODE: 1234`. |
| Keypad body | `<svg class="pad" id="pad">` (viewBox 240×310) | Grey rounded housing, up to 320px wide (82% of the viewport on small screens). Matches the repo's `assets/keypad.svg` layout. |
| Display | `<g class="display" id="display">` | Dark screen with **4 slots** (`.slot`) and **4 digits** (`.digit`), generated in JS. The next empty slot has a light outline (`.slot.next`). |
| Keys | `<g class="key">` × 11 (1–9, 0, CLEAR) | Generated in JS. Each has a dark base edge plus a raised cap and label (`.face`) that sinks when pressed. Focusable (`tabindex=0`, `role="button"`). |
| Lamp | `<g class="lamp" id="lamp">` | Sits in the keypad's ✓ position. Not a key: a recessed grey tile with a faint check mark that lights up white with a dark check on success. |
| Message | `<p id="message" aria-live="assertive">` | Blank, `✓ CODE ACCEPTED` or `INCORRECT CODE`. Announced immediately by screen readers. |
| Reset | `<button id="reset">` | Small outlined text button. Always enabled. |

The look is monochrome grey with Arial. Page colors are CSS custom properties
with a light and a dark palette (follows the OS setting, or forced with
`data-theme="light"`/`"dark"` on `<html>`). The keypad itself keeps fixed
greys in both themes.

## User actions, feedback, states and transitions

### State (JS variables)

- `entered`: the digits typed so far (`''` to 4 characters).
- `locked`: `true` while a wrong code is showing, or after the right code.
- `accepted`: set `true` on success, but nothing in the code reads it.

### States

| State | Display | Keys | Lamp | Message |
| --- | --- | --- | --- | --- |
| **ENTERING** (initial, 0–3 digits) | Dark; digits shown in white; next slot outlined | Enabled | Unlit | Blank |
| **CHECKING** (4 digits, 200ms) | All 4 digits shown | Enabled, but extra digits are ignored | Unlit | Blank |
| **WRONG** (1100ms) | Slots white, digits dark, shakes once (0.3s) | Disabled (`.off`, greyed, `aria-disabled="true"`) | Unlit | `INCORRECT CODE` |
| **ACCEPTED** (final) | Slots light grey, digits dark | Disabled | Lit | `✓ CODE ACCEPTED` |

### Transitions

- ENTERING → ENTERING: each digit fills the next slot with a small drop-in
  animation (`.pop`, 0.15s). **CLEAR** empties the entry.
- ENTERING → CHECKING: on the 4th digit; `check()` runs after 200ms.
- CHECKING → ACCEPTED: if the entry equals `CODE`.
- CHECKING → WRONG → ENTERING: otherwise; after 1100ms the entry clears and
  the keys re-enable automatically.
- Any state → ENTERING (empty): **RESET**.

### Actions and feedback

1. **Hover** a key: its cap lightens.
2. **Pointer down** on a key: the cap drops 3 units and darkens (`.down`). It
   pops back up on release, or when the pointer leaves or is cancelled.
3. **Click** a key: the digit is added, or CLEAR empties the entry.
4. **Keyboard on a focused key** (Tab to it, then Enter/Space): `tap()` plays a
   110ms press animation and activates it.
5. **Typing anywhere on the page** (focus not on a key or button): digits `0`–`9`
   press the matching key; `Backspace` or `Escape` presses CLEAR. Each shows the
   same press animation.
6. **Click RESET**: clears the entry, the wrong/right display styles and the
   lamp, re-enables the keys and blanks the message.

### Accessibility details

- Keys are focusable SVG groups with `role="button"` and an `aria-label`
  (`"1"`…`"0"`, `"Clear"`); disabled keys get `aria-disabled="true"`.
- Focused keys show a dashed outline on the cap (`:focus-visible`).
- The keypad SVG is a labelled group (`aria-label="Keypad"`); the lamp is
  `aria-hidden`.
- The message is an assertive live region.
- `prefers-reduced-motion: reduce` removes transitions, the digit drop-in and
  the shake.

## Where it's implemented (`index.html`)

| Concern | Lines |
| --- | --- |
| Host base styles (safe-area padding etc.) | 8–13 |
| Color tokens and font, incl. dark mode | 15–26 |
| Page layout (`body`), instruction, keypad SVG sizing | 28–38 |
| Key styles: base, cap, label, hover, pressed (`.down`), focus, disabled (`.off`) | 40–54 |
| Lamp styles, unlit and `.lit` | 56–60 |
| Display slots and digits, `.next`, `.pop` animation | 62–67 |
| Display `.wrong`, `.right` and `.shake` animation | 68–73 |
| Message styles | 75 |
| Reset button styles | 77–82 |
| Reduced-motion overrides | 84–87 |
| Markup: instruction | 92 |
| Markup: keypad SVG (housing, display, empty `#keys` group) | 94–100 |
| Markup: message and reset | 102–103 |
| JS: `CODE`, element lookups, state variables | 106–111 |
| JS: `el()` SVG element helper | 113–118 |
| JS: build the 4 display slots and digits | 120–126 |
| JS: build keys and lamp from `LAYOUT`, pointer/click/keyboard handlers | 128–156 |
| JS: `tap(v)` animated press for keyboard input | 158–165 |
| JS: `render(popIndex)` updates digits, next-slot outline, drop-in | 167–176 |
| JS: `setKeys(enabled)` enable/disable all keys | 178–183 |
| JS: `activate(v)` digit/CLEAR logic, triggers check | 185–193 |
| JS: `check()` accepted vs. wrong paths, 1100ms auto-recover | 195–217 |
| JS: `reset()` | 219–226 |
| JS: reset button listener | 228 |
| JS: page-wide physical keyboard input | 230–235 |
| JS: initial render | 237 |

## External dependencies and assets

- **None.** No web fonts, JS libraries, frameworks, build tools or package manager.
- **No** image files. The keypad is inline SVG; the display slots, keys and
  lamp are created by JavaScript at load.
- Runs in any modern browser by opening `index.html` directly, offline included.

## Notes for integrating into a sequential prototype

- The step has no "completed" event. To chain it, dispatch a custom event (e.g.
  `document.dispatchEvent(new CustomEvent('code:accepted'))`) in the success
  branch of `check()`, after the lamp lights.
- To lock the keypad until an earlier step finishes, call `setKeys(false)` and
  set `locked = true`. Note that the page-wide keyboard listener goes through
  `tap()`, which already ignores `.off` keys.
- The page-wide `keydown` listener captures digits typed anywhere on the page.
  When this shares a page with other studies, limit it to when the keypad step
  is active.
- Known quirks:
  - If RESET is clicked during the 200ms check delay, `check()` still runs on
    the now-empty entry and shows `INCORRECT CODE`.
  - If RESET is clicked during the 1100ms wrong-code pause, the pending
    timeout later clears any digits typed in the meantime.
  - Storing both timeout IDs and calling `clearTimeout` in `reset()` fixes both.
  - While a key has focus, typing digits does nothing (the page-wide listener
    skips focused keys); only Enter/Space activate the focused key.
- IDs (`pad`, `display`, `keys`, `lamp`, `message`, `reset`) and top-level names
  (`reset`, `render`, `check`, `activate`, `el`, `CODE`) are generic. Namespace
  them if they will share a page with other studies. The Press Me Button and
  Flip the Switch studies also use `#reset` and `#message`/`#status`.
