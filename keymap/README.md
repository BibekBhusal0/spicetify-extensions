# keymap

Vim-style keyboard shortcuts for Spotify. The extension adds scrolling, track and volume controls, navigation, panel toggles, and a `?` help dialog.

The Omarchy installer links `keymap.js` from the separate `spicetify-keys` repository. To install manually, put `keymap.js` in Spicetify's `Extensions` folder, then run:

```bash
spicetify config extensions keymap.js
spicetify apply
```

## Shortcuts

- Scrolling: `j` / `k`, `d` / `u`, `gg` / `Shift+g`
- Playback: `n` / `p`, `a` / `m`, `s`, `l`, `Ctrl+←/→`, `Ctrl+↑/↓`
- Navigation: `h`, `/`, `q`, `Shift+l`
- Panels: `Ctrl+b`, `Ctrl+Shift+b`, `f`
- Other: `Shift+f`, `?`, `Esc`, `Ctrl+q`

Press `?` to open the help dialog. While it is open, `j`, `k`, `d`, and `u` scroll its contents. Click outside it or press `Esc` to close it. The extension does not change Spotify playback state except when a playback shortcut is used.
