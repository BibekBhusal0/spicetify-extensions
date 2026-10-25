import { useStore } from "@nanostores/react";
import {
  $animationFpsCap,
  $animationFpsCapEnabled,
  $skipSpicyFont,
} from "../../../utils/stores.ts";
import { Slider, Toggle } from "./components.tsx";
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
        useDisabled: () =>
          !useStore($animationFpsCapEnabled) && "Turn on Limit Frame Rate to change this.",
        Control: ({ disabled, label }) => (
          <Slider
            label={label}
            value={useStore($animationFpsCap)}
            min={15}
            max={240}
            step={5}
            defaultValue={60}
            unit="FPS"
            onChange={(v) => $animationFpsCap.set(v)}
            disabled={disabled}
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
