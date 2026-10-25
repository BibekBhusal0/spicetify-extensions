import { useStore } from "@nanostores/react";
import {
  $lockedMediaBox,
  $npvSidebarBehavior,
  $removeSpotifyLyricsButton,
  $showNoLyricsNotice,
  $showVolumeSlider,
  $timelineOutsideMediaContent,
  $viewControlsPosition,
} from "../../../utils/stores.ts";
import { $isGlobalNav } from "../../../utils/uiState.ts";
import { Select, Toggle } from "./components.tsx";
import { InterfaceIcon } from "./icons.tsx";
import type { GroupDef, SectionDef } from "./model.ts";

const groups: GroupDef[] = [
  {
    title: "Lyrics View",
    settings: [
      {
        id: "viewControlsPosition",
        label: "View Controls Position",
        keywords: "lyrics controls top bottom",
        useDisabled: () =>
          !useStore($isGlobalNav) && "Only available with Spotify's new navigation layout.",
        Control: ({ disabled, label }) => (
          <Select
            label={label}
            value={useStore($viewControlsPosition)}
            options={["Top", "Bottom"]}
            onChange={(v) => $viewControlsPosition.set(v)}
            disabled={disabled}
          />
        ),
      },
      {
        id: "timelineOutsideMediaContent",
        label: "Timeline Outside Media Box",
        keywords: "progress bar seek",
        Control: ({ label }) => (
          <Toggle
            label={label}
            checked={useStore($timelineOutsideMediaContent)}
            onChange={(v) => $timelineOutsideMediaContent.set(v)}
          />
        ),
      },
      {
        id: "lockedMediaBox",
        label: "Lock Media Box in Compact Mode",
        keywords: "size artwork",
        Control: ({ label }) => (
          <Toggle
            label={label}
            checked={useStore($lockedMediaBox)}
            onChange={(v) => $lockedMediaBox.set(v)}
          />
        ),
      },
      {
        id: "showNoLyricsNotice",
        label: "No Lyrics Notice",
        keywords: "unavailable missing message hide page",
        Control: ({ label }) => (
          <Toggle
            label={label}
            checked={useStore($showNoLyricsNotice)}
            onChange={(v) => $showNoLyricsNotice.set(v)}
          />
        ),
      },
      {
        id: "showVolumeSlider",
        label: "Volume Slider",
        Control: ({ label }) => (
          <Toggle
            label={label}
            checked={useStore($showVolumeSlider)}
            onChange={(v) => $showVolumeSlider.set(v)}
          />
        ),
      },
    ],
  },
  {
    title: "Windows and Buttons",
    settings: [
      {
        id: "npvSidebarBehavior",
        label: "Now Playing View Sidebar",
        keywords: "npv sidebar queue recommendations",
        Control: ({ label }) => (
          <Select
            label={label}
            value={useStore($npvSidebarBehavior)}
            options={["remember", "always-close", "always-open"]}
            labels={["Remember", "Always Close", "Always Open"]}
            onChange={(v) => $npvSidebarBehavior.set(v)}
          />
        ),
      },
      {
        id: "removeSpotifyLyricsButton",
        label: "Hide Spotify's Lyrics Button",
        keywords: "remove playbar",
        Control: ({ label }) => (
          <Toggle
            label={label}
            checked={useStore($removeSpotifyLyricsButton)}
            onChange={(v) => $removeSpotifyLyricsButton.set(v)}
          />
        ),
      },
    ],
  },
];

export const interfaceSection: SectionDef = {
  id: "interface",
  title: "Interface",
  icon: InterfaceIcon,
  groups: () => groups,
};
