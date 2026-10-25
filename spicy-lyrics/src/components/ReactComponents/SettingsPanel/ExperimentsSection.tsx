import { getVisibleExperiments, RefreshExperimentOverrides } from "../../../utils/experiments.ts";
import { ExperimentRow, SyncStatus } from "./ExperimentsPanel.tsx";
import { ExperimentsIcon } from "./icons.tsx";
import type { SectionDef } from "./model.ts";

export const experimentsSection: SectionDef = {
  id: "experiments",
  title: "Experiments",
  icon: ExperimentsIcon,
  emptyText: "No experiments right now.",
  Accessory: SyncStatus,
  onEnter: () => void RefreshExperimentOverrides(),
  groups: () => [
    {
      settings: getVisibleExperiments().map((experiment) => ({
        id: `experiment:${experiment.id}`,
        label: experiment.label,
        description: experiment.description,
        keywords: "experiment",
        render: (label) => <ExperimentRow experiment={experiment} label={label} />,
      })),
    },
  ],
};
