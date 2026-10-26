import { useStore } from "@nanostores/react";
import {
  $animationFpsCap,
  $animationFpsCapEnabled,
  $npvSidebarBehavior,
  $removeSpotifyLyricsButton,
  $skipSpicyFont,
} from "../../../utils/stores.ts";
import { Select, Slider, Toggle } from "./components.tsx";
import { AppearanceIcon } from "./icons.tsx";
import type { GroupDef, SectionDef } from "./model.ts";

const groups: GroupDef[] = [
  {
    title: "Text",
    settings: [
      {
        id: "skipSpicyFont",
        label: "Use System Font",
        keywords: "default font typeface",
        Control: ({ label }) => (
          <Toggle
            label={label}
            checked={useStore($skipSpicyFont)}
            onChange={(v) => $skipSpicyFont.set(v)}
          />
        ),
      },
    ],
  },
  {
    title: "Performance",
    settings: [
      {
        id: "animationFpsCapEnabled",
        label: "Limit Frame Rate",
        keywords: "fps cap animation",
        Control: ({ label }) => (
          <Toggle
            label={label}
            checked={useStore($animationFpsCapEnabled)}
            onChange={(v) => $animationFpsCapEnabled.set(v)}
          />
        ),
      },
      {
        id: "animationFpsCap",
        label: "Frame Rate",
        keywords: "fps cap animation",
        stacked: true,
        useVisible: () => useStore($animationFpsCapEnabled),
        Control: ({ label }) => (
          <Slider
            label={label}
            value={useStore($animationFpsCap)}
            min={15}
            max={240}
            step={5}
            defaultValue={60}
            unit="FPS"
            onChange={(v) => $animationFpsCap.set(v)}
          />
        ),
      },
    ],
  },
  {
    title: "Spotify UI",
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

export const appearanceSection: SectionDef = {
  id: "appearance",
  title: "Appearance",
  icon: AppearanceIcon,
  groups: () => groups,
};
