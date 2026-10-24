# spicetify-keys

Vim-driven navigation for the Spotify desktop client, as a
[Spicetify](https://github.com/spicetify/cli) extension.

Fork of spicetify's bundled `keyboardShortcut.js` with reworked bindings that
match how I actually drive the app. Original extension by khanhas and OhItsTom
(spicetify/cli, LGPL-2.1); published upstream under the same license.

## Install

```bash
cp omarchy-keys.js ~/.config/spicetify/Extensions/
spicetify config extensions keyboardShortcut.js- omarchy-keys.js fullAppDisplay.js
spicetify apply
```

## Keybinds

| Key | Action |
|---|---|
| `d` / `u` | scroll half a page down/up (throttled while held) |
| `j` / `k` | scroll continuously while held |
| `g g` / `Shift+g` | jump to top / bottom |
| `n` / `p` | next / previous track |
| `Shift+f` | vim overlay: letter labels on every clickable element (`Esc` to quit) |
| `f` | fullscreen player (delegates to fullAppDisplay's `F11` toggle) |
| `Ctrl+q` | quit Spotify |
| `Ctrl+Tab` / `Ctrl+Shift+Tab` | cycle sidebar items |
| `Ctrl+left` / `Ctrl+right` | previous / next track |
| `Ctrl+up` / `Ctrl+down` | volume ± |
| `Shift+h` / `Shift+l` | history back / forward |
| `m` | like current track |
| `/` | open search page |
