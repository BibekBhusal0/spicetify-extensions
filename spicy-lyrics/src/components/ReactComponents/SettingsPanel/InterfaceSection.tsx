import { useStore } from "@nanostores/react";
import {
  $lyricsSkeleton,
  $npvSidebarBehavior,
  $removeSpotifyLyricsButton,
} from "../../../utils/stores.ts";
import { Select, Toggle } from "./components.tsx";
import { InterfaceIcon } from "./icons.tsx";
import type { GroupDef, SectionDef } from "./model.ts";

const groups: GroupDef[] = [
  {
    title: "Lyrics View",
    settings: [
      {
        id: "lyricsSkeleton",
        label: "Loading Placeholder",
        keywords: "skeleton loading shimmer spinner",
        Control: ({ label }) => (
          <Toggle
            label={label}
            checked={useStore($lyricsSkeleton)}
            onChange={(v) => $lyricsSkeleton.set(v)}
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
