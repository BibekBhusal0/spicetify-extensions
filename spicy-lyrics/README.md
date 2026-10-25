# Spicy Lyrics

Spicy Lyrics is a fork of [Spikerko's Spicy Lyrics](https://github.com/Spikerko/spicy-lyrics). This fork keeps the lyrics view minimal, removing many things and keeping it performant.

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

This fork is more performance efficient by using a static cover background and removing background animation, popup lyrics, and the custom sidebar card. You can reduce work further by:

- Turn off lyric effects you do not use, such as word animation and smooth scrolling.
- Keep the lyric view closed when you do not need it.

Spicy Lyrics retains the upstream GPL-3.0 license and attribution.
