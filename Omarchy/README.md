# Omarchy theme for Spicetify

This theme applies the repository's Spotify CSS overrides and maps the active Omarchy palette into Spicetify colors.

## Install

The Omarchy installer clones this repository, links the `Omarchy` folder into Spicetify's `Themes` directory, and links `theme-hook.sh` into Omarchy's `theme-set.d` hooks. To install by hand on Omarchy, run:

```bash
mkdir -p ~/.config/spicetify/Themes ~/.config/omarchy/hooks/theme-set.d
ln -sfn ~/Code/spicetify-extensions/Omarchy ~/.config/spicetify/Themes/Omarchy
ln -sfn ~/Code/spicetify-extensions/Omarchy/theme-hook.sh ~/.config/omarchy/hooks/theme-set.d/spicetify.sh
spicetify config current_theme Omarchy color_scheme omarchy
spicetify apply
bash ~/.config/omarchy/hooks/theme-set.d/spicetify.sh
```

Spotify must have launched and Spicetify must have a backup before the theme can apply. On a first install, open Spotify, log in, then rerun the Omarchy installer or run the commands above.

## Theme colors

`color.ini` is generated in this folder by `theme-hook.sh`. It is ignored by Git because the hook rewrites it whenever the active Omarchy theme changes. The installer runs the hook before `spicetify apply` to create the color scheme, then runs it again to refresh Spotify's generated files. Later theme changes run the same hook automatically and refresh the Spotify UI without restarting the client.

If colors have not initialized, run:

```bash
bash ~/.config/omarchy/hooks/theme-set.d/spicetify.sh
```

The hook uses `omarchy-theme-color`, writes Spicetify's palette files under `/opt/spotify/Apps/xpui`, and reloads Spotify over the configured remote debugging port. Spotify must be running for the reload to happen.
