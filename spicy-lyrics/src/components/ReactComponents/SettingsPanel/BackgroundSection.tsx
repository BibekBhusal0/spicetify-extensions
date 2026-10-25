import { useStore } from "@nanostores/react";
import { $backgroundBlur, $backgroundStyle, BACKGROUND_STYLES, type BackgroundStyle } from "../../../utils/stores.ts";
import { Select, Slider } from "./components.tsx";
import { BackgroundIcon } from "./icons.tsx";
import type { GroupDef, SectionDef } from "./model.ts";

const labels: Record<BackgroundStyle, string> = {
  artist: "Artist image",
  cover: "Cover art",
  color: "Cover colors",
  none: "Transparent",
};

const groups: GroupDef[] = [{
  title: "Lyrics view",
  settings: [
    {
      id: "backgroundStyle",
      label: "Background",
      description: "Choose a still image or color from the current track.",
      keywords: "artist image cover art colors transparent",
      Control: ({ label }) => (
        <Select
          label={label}
          value={useStore($backgroundStyle)}
          options={[...BACKGROUND_STYLES]}
          labels={BACKGROUND_STYLES.map((style) => labels[style])}
          onChange={(value) => $backgroundStyle.set(value as BackgroundStyle)}
        />
      ),
    },
    {
      id: "backgroundBlur",
      label: "Image blur",
      description: "Soften cover art or artist images behind the lyrics.",
      keywords: "background image blur",
      stacked: true,
      useDisabled: () => !["artist", "cover"].includes(useStore($backgroundStyle)) && "Only applies to image backgrounds.",
      Control: ({ disabled, label }) => (
        <Slider
          label={label}
          value={useStore($backgroundBlur)}
          min={0}
          max={48}
          defaultValue={24}
          unit="px"
          onChange={(value) => $backgroundBlur.set(value)}
          disabled={disabled}
        />
      ),
    },
  ],
}];

export const backgroundSection: SectionDef = {
  id: "background",
  title: "Background",
  icon: BackgroundIcon,
  groups: () => groups,
};
