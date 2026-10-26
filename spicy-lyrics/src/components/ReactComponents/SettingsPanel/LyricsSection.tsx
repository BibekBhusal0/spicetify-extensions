import { useStore } from "@nanostores/react";
import {
  $backgroundBlur,
  $backgroundStyle,
  $joinSplitWords,
  $lyricsSkeleton,
  $simpleLyricsMode,
  BACKGROUND_STYLES,
  type BackgroundStyle,
} from "../../../utils/stores.ts";
import { Select, Slider, Toggle } from "./components.tsx";
import { LyricsIcon } from "./icons.tsx";
import type { GroupDef, SectionDef } from "./model.ts";

const backgroundLabels: Record<BackgroundStyle, string> = {
  artist: "Artist image",
  cover: "Cover art",
  color: "Cover colors",
  none: "Transparent",
};

const groups: GroupDef[] = [
  {
    title: "Style",
    settings: [
      {
        id: "simpleLyricsMode",
        label: "Simple Lyrics Mode",
        keywords: "effects plain",
        Control: ({ label }) => (
          <Toggle
            label={label}
            checked={useStore($simpleLyricsMode)}
            onChange={(v) => $simpleLyricsMode.set(v)}
          />
        ),
      },
      {
        id: "joinSplitWords",
        label: "Join Split Words",
        keywords: "syllables merge",
        Control: ({ label }) => (
          <Toggle
            label={label}
            checked={useStore($joinSplitWords)}
            onChange={(v) => $joinSplitWords.set(v)}
          />
        ),
      },
    ],
  },
  {
    title: "View",
    settings: [
      {
        id: "backgroundStyle",
        label: "Background",
        keywords: "artist image cover art colors transparent",
        Control: ({ label }) => (
          <Select
            label={label}
            value={useStore($backgroundStyle)}
            options={[...BACKGROUND_STYLES]}
            labels={BACKGROUND_STYLES.map((style) => backgroundLabels[style])}
            onChange={(value) => $backgroundStyle.set(value as BackgroundStyle)}
          />
        ),
      },
      {
        id: "backgroundBlur",
        label: "Image blur",
        keywords: "background image blur",
        stacked: true,
        useVisible: () => ["artist", "cover"].includes(useStore($backgroundStyle)),
        Control: ({ label }) => (
          <Slider
            label={label}
            value={useStore($backgroundBlur)}
            min={0}
            max={48}
            defaultValue={24}
            unit="px"
            onChange={(value) => $backgroundBlur.set(value)}
          />
        ),
      },
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
];

export const lyricsSection: SectionDef = {
  id: "lyrics",
  title: "Lyrics",
  icon: LyricsIcon,
  groups: () => groups,
};
