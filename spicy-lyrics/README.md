# Spicy Lyrics

Spicy Lyrics is a fork of [Spikerko's Spicy Lyrics](https://github.com/Spikerko/spicy-lyrics). This fork keeps the lyrics view minimal and removes popup lyrics, background animation, and the sidebar lyrics card. The page background can show cover art, an artist image, or cover colors, with adjustable blur.

## Install

Copy `dist/spicy-lyrics.js` into Spicetify's `Extensions` directory, then enable and apply it:

```bash
spicetify config extensions spicy-lyrics.js
spicetify apply
```

## Build

From this directory:

```bash
bun install
bun run build
```

## Performance

The extension no longer renders an animated background or popup lyrics. To reduce work further:

- Turn off lyric effects you do not use, such as word animation and smooth scrolling.
- Keep the lyric view closed when you do not need it.

Spicy Lyrics retains the upstream GPL-3.0 license and attribution.
