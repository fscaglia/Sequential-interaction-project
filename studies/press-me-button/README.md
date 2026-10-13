# Press Me Button

A single-button interaction study. See [STUDY.md](STUDY.md) for a full description.

## Run it

No build step and no packages to install.

- **Quickest:** open `index.html` in any modern browser.
- **Local server (optional):** from this folder run `python3 -m http.server 8000`
  (or `npx serve .`) and visit http://localhost:8000.

## Dependencies

- **IBM Plex Mono** (weights 500 and 600), loaded from Google Fonts. It's optional:
  offline, the page falls back to `ui-monospace`, Menlo or the system monospace
  font and everything still works.
- No JavaScript libraries, frameworks or image files. The check mark and reset
  icon are inline SVG.
