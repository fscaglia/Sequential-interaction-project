# Enter the Code

A keypad code-entry interaction study. See [STUDY.md](STUDY.md) for a full description.

## Run it

No build step and no packages to install.

- **Quickest:** open `index.html` in any modern browser.
- **Local server (optional):** from this folder run `python3 -m http.server 8000`
  (or `npx serve .`) and visit http://localhost:8000.

## Dependencies

None. The page uses system fonts (Arial/Helvetica) and builds the keypad as
inline SVG with JavaScript. It works fully offline.

The correct code is `1234`, set by `const CODE` in `index.html`.
