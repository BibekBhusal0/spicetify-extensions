# spicetify-keys

Vim-driven navigation for the Spotify desktop client, as a
[Spicetify](https://github.com/spicetify/cli) extension.

Fork of spicetify's bundled `keyboardShortcut.js` with reworked bindings that
match how I actually drive the app. Original extension by khanhas and OhItsTom
(spicetify/cli, LGPL-2.1); published upstream under the same license.

## Install

```bash
cp keymap.js ~/.config/spicetify/Extensions/
spicetify config extensions adblock.js keymap.js
spicetify apply
```

## Keybinds

| Key | Action |
|---|---|
| `?` | help modal (Spotify's native shortcuts modal is suppressed) |
| `Esc` | close the help modal, or unfocus a search / text field |
| `d` / `u` | scroll half a page down/up (throttled while held) |
| `Ctrl+d` / `Ctrl+u` | scroll half a page down/up |
| `j` / `k` | scroll lines |
| `g g` / `Shift+g` | jump to top / bottom |
| `n` / `p` | next / previous track |
| `a` / `m` | like current track |
| `s` | toggle shuffle |
| `l` | toggle repeat |
| `f` | toggle lyrics |
| `q` | toggle queue panel |
| `h` | home |
| `Alt+h` / `Alt+l` | history back / forward |
| `Shift+l` | open Your Library (full page) |
| `Ctrl+b` | toggle library sidebar |
| `Ctrl+Shift+b` | toggle now playing view |
| `Ctrl+ ←/→` | previous / next track |
| `Ctrl+ ↑/↓` | volume −/+ |
| `Ctrl+Tab` / `Ctrl+Shift+Tab` | cycle sidebar items |
| `Shift+f` | vim overlay: letter labels on every clickable element (`Esc` to quit) |
| `/` | open search page |
| `Ctrl+q` | quit Spotify |

While the help modal is open, `j`/`k`, `d`/`u` and `g g`/`Shift+g` scroll the
modal instead of the page.
