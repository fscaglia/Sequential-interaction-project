# CLAUDE.md

## How to ask questions

- Use the AskUserQuestion tool for every question. Do not write questions as a list in your reply.
- Ask one question at a time and wait for the answer before asking the next.
- For each question, offer 2–4 suggested answers based on what you found in the project. The user can always pick "Other" to type their own.

## Publishing changes to the live site

The live site is the repository root (`index.html`, `css/`, `js/`), served by GitHub Pages from `main`.

Every time a change is applied to the live site:

1. Commit it and push it straight to `main` (the user has approved pushing to `main` for this).
2. Also publish the page as a Claude artifact so the change can be viewed right away while GitHub Pages builds and deploys:
   - Publish `index.html` with the Artifact tool, passing `css/style.css`, `js/audio.js`, `js/controls.js`, `js/main.js`, `assets/switch.svg`, `assets/keypad.svg` and `assets/button.svg` through `files` at those same relative paths.
   - Update the existing artifact (same URL) rather than creating a new one. Its URL is recorded below.
3. Give the user both links: the artifact and https://fscaglia.github.io/Sequential-interaction-project/.

Artifact for the live site: https://claude.ai/artifact/LMizaUoKUGT99m2mru44Te
