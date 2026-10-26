import { useStore } from "@nanostores/react";
import {
  $playbackOffset,
  $scrollLeadEnabled,
  $scrollLeadMs,
  $seekFadeCompensation,
  $smoothScrolling,
} from "../../../utils/stores.ts";
import { Slider, Toggle } from "./components.tsx";
import { PlaybackIcon } from "./icons.tsx";
import type { GroupDef, SectionDef } from "./model.ts";

const groups: GroupDef[] = [
  {
    title: "Timing",
    settings: [
      {
        id: "playbackOffset",
        label: "Playback Offset",
        keywords: "sync delay latency milliseconds",
        stacked: true,
        Control: ({ label }) => (
          <Slider
            label={label}
            value={useStore($playbackOffset)}
            min={-5000}
            max={5000}
            step={10}
            defaultValue={0}
            unit="ms"
            onChange={(v) => $playbackOffset.set(v)}
          />
        ),
      },
      {
        id: "seekFadeCompensation",
        label: "Seek Fade-in Compensation",
        keywords: "click jump",
        Control: ({ label }) => (
          <Toggle
            label={label}
            checked={useStore($seekFadeCompensation)}
            onChange={(v) => $seekFadeCompensation.set(v)}
          />
        ),
      },
    ],
  },
  {
    title: "Scrolling",
    settings: [
      {
        id: "smoothScrolling",
        label: "Smooth Scrolling",
        Control: ({ label }) => (
          <Toggle
            label={label}
            checked={useStore($smoothScrolling)}
            onChange={(v) => $smoothScrolling.set(v)}
          />
        ),
      },
      {
        id: "scrollLeadEnabled",
        label: "Early Scroll",
        keywords: "lead ahead",
        Control: ({ label }) => (
          <Toggle
            label={label}
            checked={useStore($scrollLeadEnabled)}
            onChange={(v) => $scrollLeadEnabled.set(v)}
          />
        ),
      },
      {
        id: "scrollLeadMs",
        label: "Early Scroll Time",
        keywords: "lead ahead",
        stacked: true,
        useVisible: () => useStore($scrollLeadEnabled),
        Control: ({ label }) => (
          <Slider
            label={label}
            value={useStore($scrollLeadMs)}
            min={0}
            max={800}
            step={10}
            defaultValue={250}
            unit="ms"
            onChange={(v) => $scrollLeadMs.set(v)}
          />
        ),
      },
    ],
  },
];

export const playbackSection: SectionDef = {
  id: "playback",
  title: "Playback",
  icon: PlaybackIcon,
  groups: () => groups,
};
