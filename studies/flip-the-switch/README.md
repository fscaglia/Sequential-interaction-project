# Flip the Switch

A single toggle-switch interaction study. See [STUDY.md](STUDY.md) for a full description.

## Run it

No build step and no packages to install.

- **Quickest:** open `index.html` in any modern browser.
- **Local server (optional):** from this folder run `python3 -m http.server 8000`
  (or `npx serve .`) and visit http://localhost:8000.

## Dependencies

None. The page uses system fonts (Arial/Helvetica), draws the switch as inline
SVG, and makes its click sound with the browser's built-in Web Audio API. It
works fully offline.
