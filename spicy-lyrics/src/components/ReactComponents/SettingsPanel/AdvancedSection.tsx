import {
  RemoveCurrentLyrics_AllCaches,
  RemoveLyricsCache,
} from "../../../utils/LyricsCacheTools.ts";
import { AdvancedIcon } from "./icons.tsx";
import type { GroupDef, SectionDef } from "./model.ts";

const groups: GroupDef[] = [
  {
    title: "Lyrics Cache",
    settings: [
      {
        id: "clearCurrentSongCaches",
        label: "Clear This Song's Cache",
        keywords: "clear all caches current song",
        Control: () => (
          <button
            type="button"
            className="sl-sp-btn"
            onClick={() => RemoveCurrentLyrics_AllCaches(true)}
          >
            Clear
          </button>
        ),
      },
      {
        id: "clearStoredLyricsCache",
        label: "Clear Stored Lyrics",
        keywords: "clear lyrics cache",
        Control: () => (
          <button type="button" className="sl-sp-btn" onClick={() => RemoveLyricsCache(true)}>
            Clear
          </button>
        ),
      },
    ],
  },
];

export const advancedSection: SectionDef = {
  id: "advanced",
  title: "Advanced",
  icon: AdvancedIcon,
  secondary: true,
  groups: () => groups,
};
