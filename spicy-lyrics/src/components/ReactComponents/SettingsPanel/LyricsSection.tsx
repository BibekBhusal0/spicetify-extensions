import { useStore } from "@nanostores/react";
import { $joinSplitWords, $simpleLyricsMode } from "../../../utils/stores.ts";
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
];

export const lyricsSection: SectionDef = {
  id: "lyrics",
  title: "Lyrics",
  icon: LyricsIcon,
  groups: () => groups,
};
