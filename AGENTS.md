# Repository guide

This repository contains personal Spotify modifications distributed as Spicetify extensions and a theme. Keep changes focused on the requested feature, preserve upstream licenses, and avoid adding explanatory comments where the code is already clear.

## Folders

- `keymap/`: keyboard shortcuts for Spotify. Its installable entry is `keymap.js`.
- `spicy-lyrics/`: the Spicy Lyrics fork. TypeScript lives in `src/`; the production extension is `dist/spicy-lyrics.js`.
- `Omarchy/`: the Omarchy Spotify theme, its palette hook, and `user.css`. `color.ini` is generated locally by the hook and is not tracked.

The root README describes the repository. Each extension and the theme have their own README with setup details.

## Spicy Lyrics development

Run these commands from `spicy-lyrics/`:

```bash
bun install
bun run build
bun run lint
```

`bun run build` writes `dist/spicy-lyrics.js`, which is the file Spicetify loads. `bun run dev` starts the creator's development workflow and syncs to the local Spicetify setup.

The extension runs inside Spotify and uses the `window.Spicetify` API. `spice.config.ts` configures `@spicemod/creator`. Do not treat it as a browser app that can run independently.

## Spicy Lyrics structure

- `src/app.tsx`: startup, Spotify integration, event wiring, and playbar controls.
- `src/components/Pages/`: lyrics page and its view controls.
- `src/components/Utils/`: fullscreen, compact mode, and Spotify UI integration.
- `src/components/ReactComponents/`: settings, lyrics manager, notices, and dialogs.
- `src/utils/Lyrics/`: lyric fetching, parsing, caching, rendering, scrolling, and virtualization.
- `src/css/`: page, lyrics, settings, and component styles.
- `src/utils/stores.ts`: persisted settings and runtime stores.
- `dist/`: generated production bundle. Rebuild it after source changes that affect the installed extension.

Feature experiments are registered in `spicy-lyrics/src/utils/experiments.ts`. Prefer a CSS class switch for visual changes. If behavior or markup changes, keep both experiment states functional and use the existing persisted experiment store.

## Theme

The theme is selected as `Omarchy` with the `omarchy` color scheme. `theme-hook.sh` reads the active desktop palette, creates `color.ini`, updates Spotify's generated color assets, and reloads Spotify's UI over its configured CEF debug port. The generated `color.ini` changes with the palette and must remain untracked.

On a new machine, run the theme hook before `spicetify apply` so the color scheme exists. The Omarchy overrides install script does this automatically. Spotify must launch and initialize before Spicetify can back up and patch its client files.

## Keymap

`keymap/keymap.js` is installed by the overrides setup. Keep `keymap/README.md` shortcuts in sync with the actual bindings. `f` opens Spicy Lyrics fullscreen when its control is available and falls back to Spotify's lyrics control.

## Licensing and attribution

Spicy Lyrics is a fork of [Spikerko/spicy-lyrics](https://github.com/Spikerko/spicy-lyrics) and retains its GPL-3.0 license and attribution. The keymap and theme are MIT licensed. Preserve notices when changing or moving upstream-derived code.
