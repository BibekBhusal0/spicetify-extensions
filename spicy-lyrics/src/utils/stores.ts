import { atom } from "nanostores";
import { ProjectVersion } from "../../project/config.ts";

export const SETTINGS_KEY = "SL:settings";

function readSettingsBlob(): Record<string, any> {
  const raw = Spicetify.LocalStorage.get(SETTINGS_KEY);
  if (raw === null || raw === undefined) return {};
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function saveSettingsBlob(obj: Record<string, any>) {
  Spicetify.LocalStorage.set(SETTINGS_KEY, JSON.stringify(obj));
}

function migrateSettingsKeys(blob: Record<string, any>): Record<string, any> {
  const renames: Record<string, string> = {
    "skip-spicy-font": "skipSpicyFont",
    // Was an experiment; carry over the choice of anyone who toggled it.
    "experiment:duetLinePadding": "duetLinePadding",
  };
  let changed = false;
  for (const [oldKey, newKey] of Object.entries(renames)) {
    if (oldKey in blob) {
      blob[newKey] = blob[oldKey];
      delete blob[oldKey];
      changed = true;
    }
  }
  // Simple Lyrics Mode lost its "Animate" style; everyone gets the one that was the default.
  if ("simpleLyricsModeRenderingType" in blob) {
    delete blob.simpleLyricsModeRenderingType;
    changed = true;
  }
  if (blob.backgroundStyle === "dynamic") {
    blob.backgroundStyle = "cover";
    changed = true;
  }
  if (changed) saveSettingsBlob(blob);
  return blob;
}

const _settings: Record<string, any> = migrateSettingsKeys(readSettingsBlob());

/**
 * An atom backed by the settings blob. Exported so feature modules (e.g.
 * `experiments.ts`) can register their own persisted settings without having to
 * add a line here for every one.
 */
export function persistAtom<T>(key: string, defaultValue: T) {
  const store = atom<T>(_settings[key] !== undefined ? _settings[key] : defaultValue);
  let saveTimer: ReturnType<typeof setTimeout> | undefined;
  store.listen((v) => {
    _settings[key] = v;
    // Writes go through Spotify's JSON-encoded storage; a slider dragging
    // through values would otherwise write on every step.
    clearTimeout(saveTimer);
    saveTimer = setTimeout(() => saveSettingsBlob(_settings), 250);
  });
  return store;
}

// Setting atoms (persisted)
export const $simpleLyricsMode = persistAtom<boolean>("simpleLyricsMode", true);
export const $minimalLyricsMode = persistAtom<boolean>("minimalLyricsMode", false);
// Shows a word sung in syllables as one word when its parts line up evenly.
export const $joinSplitWords = persistAtom<boolean>("joinSplitWords", false);
// Tinted box drawn behind a lyrics line while the pointer is over it.
export const $lineHoverBackground = persistAtom<boolean>("lineHoverBackground", true);
// Wide inset on the side a duet line leans away from, so the two voices read as
// separate columns. Off gives duet lines the same slight padding as every line.
export const $duetLinePadding = persistAtom<boolean>("duetLinePadding", true);
// When a song ends on a duet line sung from the right, the credits under it
// (writers, provider, community info) move to the right with it.
export const $creditsFollowLastLine = persistAtom<boolean>("creditsFollowLastLine", false);
export const $skipSpicyFont = persistAtom<boolean>("skipSpicyFont", true);
// Off: a song that simply has no lyrics shows only the song info. Errors still show their notice.
export const $showNoLyricsNotice = persistAtom<boolean>("showNoLyricsNotice", true);
// Hide Spotify's own lyrics button in the playback bar (ours is left alone).
export const $removeSpotifyLyricsButton = persistAtom<boolean>("removeSpotifyLyricsButton", true);
export const $lockedMediaBox =persistAtom<boolean>("lockedMediaBox", false);
export const $viewControlsPosition = persistAtom<string>("viewControlsPosition", "Top");
export const $ttmlMakerMode = persistAtom<boolean>("ttmlMakerMode", true);
// Last upload mode picked in the Local DB upload screen: "persistent" | "temporary".
export const $ttmlUploadMode = persistAtom<string>("ttmlUploadMode", "persistent");
export const $developerMode = persistAtom<boolean>("developerMode", false);
export const $timelineOutsideMediaContent = persistAtom<boolean>(
  "timelineOutsideMediaContent",
  true
);
// Volume band below the playback controls in Fullscreen and Cinema View.
export const $showVolumeSlider = persistAtom<boolean>("showVolumeSlider", true);
// Control Spotify's Now Playing View sidebar: "remember" | "always-close" | "always-open"
export const $npvSidebarBehavior = persistAtom<string>("npvSidebarBehavior", "remember");
// Playback timing offset in milliseconds (bipolar: negative = earlier, positive = later)
export const $playbackOffset = persistAtom<number>("playbackOffset", 0);
// Clicking a line seeks this much earlier, so Spotify's ~300ms fade-in on seek
// doesn't swallow the start of the line.
export const $seekFadeCompensation = persistAtom<boolean>("seekFadeCompensation", true);
// Start auto-scrolling to a line this many ms before it becomes active.
export const $scrollLeadEnabled = persistAtom<boolean>("scrollLeadEnabled", false);
export const $scrollLeadMs = persistAtom<number>("scrollLeadMs", 250);
// Spring-driven auto-scroll instead of the browser's native smooth scroll.
export const $smoothScrolling = persistAtom<boolean>("smoothScrolling", false);
// Frame rate cap for everything that redraws every frame (lyrics animation,
// animated background, smooth-scroll glide). On high refresh rate displays every
// extra frame is another repaint of the whole page, so this bounds the per-second
// work. Off by default, which draws on every display refresh as before; the
// slider value only applies once the cap is turned on.
export const $animationFpsCapEnabled = persistAtom<boolean>("animationFpsCapEnabled", false);
export const $animationFpsCap = persistAtom<number>("animationFpsCap", 60);
export type BackgroundStyle = "artist" | "cover" | "color" | "none";
export const BACKGROUND_STYLES: BackgroundStyle[] = ["artist", "cover", "color", "none"];
export const $backgroundStyle = persistAtom<BackgroundStyle>("backgroundStyle", "cover");
export const $backgroundBlur = persistAtom<number>("backgroundBlur", 24);

// Version atom — NOT persisted, set once at startup
export const $spicyLyricsVersion = atom<string>(
  (window as any)._spicy_lyrics_metadata?.LoadedVersion ?? ProjectVersion
);

// Runtime (ephemeral) atoms
export const $currentLyricsType = atom<string>("None");
export const $lyricsContainerExists = atom<boolean>(false);
export const $currentlyFetching = atom<boolean>(false);
export const $currentLyricsData = atom<string>("");
