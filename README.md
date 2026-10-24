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
| `Esc` | close the help modal, menus, or unfocus a search / text field |

Scrolling:

| Key | Action |
|---|---|
| `d` / `u` | scroll half a page down/up (throttled while held) |
| `Ctrl+d` / `Ctrl+u` | scroll half a page down/up |
| `j` / `k` | scroll lines |
| `g g` / `Shift+g` | jump to top / bottom |

Playback:

| Key | Action |
|---|---|
| `n` / `p` | next / previous track |
| `a` / `m` | like current track |
| `s` | toggle shuffle |
| `l` | toggle repeat |
| `Ctrl+ ←/→` | previous / next track |
| `Ctrl+ ↑/↓` | volume −/+ |

Navigation / panels:

| Key | Action |
|---|---|
| `h` | home |
| `/` | open search page |
| `q` | toggle queue panel |
| `Shift+l` | open Your Library (full page) |
| `Alt+h` / `Alt+l` | history back / forward |
| `Shift+h` | history back |
| `f` | toggle lyrics |
| `Ctrl+b` | toggle library sidebar |
| `Ctrl+Shift+b` | toggle now playing view |
| `Shift+f` | vim overlay: letter labels on every clickable element (`Esc` to quit) |
| `Ctrl+q` | quit Spotify |

While the help modal is open, `j`/`k`, `d`/`u` and `g g`/`Shift+g` scroll the
modal instead of the page.
