import { useStore } from "@nanostores/react";
import {
  $creditsFollowLastLine,
  $joinSplitWords,
  $lineHoverBackground,
  $minimalLyricsMode,
  $simpleLyricsMode,
} from "../../../utils/stores.ts";
import { Toggle } from "./components.tsx";
import { LyricsIcon } from "./icons.tsx";
import type { GroupDef, SectionDef } from "./model.ts";

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
        id: "minimalLyricsMode",
        label: "Minimal Lyrics Mode",
        Control: ({ label }) => (
          <Toggle
            label={label}
            checked={useStore($minimalLyricsMode)}
            onChange={(v) => $minimalLyricsMode.set(v)}
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
    title: "Lines",
    settings: [
      {
        id: "lineHoverBackground",
        label: "Highlight on Hover",
        keywords: "line hover background",
        Control: ({ label }) => (
          <Toggle
            label={label}
            checked={useStore($lineHoverBackground)}
            onChange={(v) => $lineHoverBackground.set(v)}
          />
        ),
      },
      {
        id: "creditsFollowLastLine",
        label: "Credits Follow the Last Singer",
        keywords: "duet credits written by songwriters provided by provider align side",
        Control: ({ label }) => (
          <Toggle
            label={label}
            checked={useStore($creditsFollowLastLine)}
            onChange={(v) => $creditsFollowLastLine.set(v)}
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
