# Omarchy theme for Spotify

This Spicetify theme follows the active Omarchy palette. The `theme-hook.sh` script regenerates Spicetify's colors and reloads Spotify's UI when the palette changes. The generated `color.ini` varies by theme and is not tracked by Git.

## Install

Copy the theme CSS and hook into their configuration folders:

```bash
mkdir -p ~/.config/spicetify/Themes/Omarchy ~/.config/omarchy/hooks/theme-set.d
cp Omarchy/user.css ~/.config/spicetify/Themes/Omarchy/user.css
cp Omarchy/theme-hook.sh ~/.config/omarchy/hooks/theme-set.d/spicetify.sh
chmod +x ~/.config/omarchy/hooks/theme-set.d/spicetify.sh
spicetify config current_theme Omarchy color_scheme omarchy
```

Generate the initial palette before applying the theme:

```bash
bash ~/.config/omarchy/hooks/theme-set.d/spicetify.sh
spicetify apply
```

Spotify must be installed, and Omarchy's `omarchy-theme-color` command must be available. On a new machine, launch Spotify and sign in first. If Spicetify has not backed up the client yet, run `spicetify backup`, then initialize colors and apply the theme. The first Spotify launch may still use the default appearance until `spicetify apply` has completed.

## Color updates

Omarchy runs scripts in `~/.config/omarchy/hooks/theme-set.d` after each theme change. The copied hook creates `color.ini` in the installed theme folder, updates Spotify's generated `colors.css` and `user.css`, and reloads the Spotify UI through the configured CEF debug port. It does not restart Spotify. Run the hook manually whenever colors need to be initialized or refreshed:

```bash
bash ~/.config/omarchy/hooks/theme-set.d/spicetify.sh
```

The hook expects Spotify under `/opt/spotify` and uses port `9222` when no debug port is found in `~/.config/spotify-flags.conf`.
