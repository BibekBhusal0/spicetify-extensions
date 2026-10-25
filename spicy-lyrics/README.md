# spicy-lyrics

This is a fork of [Spicy Lyrics](https://github.com/Spikerko/spicy-lyrics). It keeps the lyrics and full-screen features and removes the custom styling and background behavior for Spotify's Now Playing View sidebar. The sidebar uses Spotify's own styling.

## Install

The Omarchy setup links this build and enables it automatically. For a manual install, copy `dist/spicy-lyrics.js` into Spicetify's `Extensions` folder, then run:

```bash
spicetify config extensions spicy-lyrics.js
spicetify apply
```

## Build

From this directory, run:

```bash
bun install
bun run build
```

The project retains the upstream GPL-3.0 license. The source changes in this fork remove Now Playing View sidebar styling and its observers.
