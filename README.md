# Spicetify extensions

Personal Spicetify extensions and an Omarchy theme. The Omarchy installer in [omarchy-overrides](https://github.com/BibekBhusal0/omarchy-overrides) clones this repository and installs the theme and spicy-lyrics build. It gets the keymap from the separate [spicetify-keys](https://github.com/BibekBhusal0/spicetify-keys) repository.

## Omarchy theme

The theme CSS lives in [Omarchy/user.css](Omarchy/user.css). The theme hook creates `Omarchy/color.ini` from the active Omarchy palette and refreshes Spotify on each Omarchy theme change. `color.ini` is generated and ignored by Git.

On first install, the installer waits until Spotify has initialized, then applies the theme and runs the color hook. If Spotify was not initialized yet, open Spotify, log in, and rerun the installer. To initialize colors by hand, run:

```bash
bash ~/.config/omarchy/hooks/theme-set.d/spicetify.sh
```

See [Omarchy/README.md](Omarchy/README.md) for manual setup.

## spicy-lyrics

This fork keeps lyrics and full-screen features while removing custom styling and background behavior from the Now Playing View sidebar. See [spicy-lyrics/README.md](spicy-lyrics/README.md) for install and build instructions.

## keymap

The keymap adds vim-style navigation to Spotify. The installer links it from the separate `spicetify-keys` checkout. See [keymap/README.md](keymap/README.md) for its shortcuts and manual setup.

## Symlinks and other systems

Spicetify's documented manual install expects extension files in its `Extensions` directory. A symlink is convenient for development on Linux and macOS because edits in the checkout are immediately used. Windows may require Developer Mode or an elevated terminal to create symlinks. Copying the built file into `Extensions` works without symlink support, but updates then require another copy. The Omarchy installer targets Linux and uses symlinks by design.

References: [Spicetify extension installation](https://spicetify.app/docs/customization/extensions), [Spicetify configuration](https://spicetify.app/docs/customization/config-file).

## License

The keymap and Omarchy theme are MIT. The spicy-lyrics fork retains its upstream GPL-3.0 license and attribution.
