export const inputOptions = [
  { label: "Worst paths per endpoint", value: "worstPaths" },
  { label: "Slack lesser than", value: "slackLesser" },
  { label: "Max paths per group", value: "maxPaths" },
  { label: "Slack greater than", value: "slackGreater" },
];

export const selectOptions = [
  {
    key: "pathType",
    label: "Path type",
    selectOption: [
      { value: "full", label: "full" },
      { value: "full_clock", label: "full_clock" },
      { value: "short", label: "short" },
      { value: "only", label: "only" },
      { value: "end", label: "end" },
    ],
  },
  {
    key: "group",
    label: "Group",
  },
  {
    key: "delayType",
    label: "Delay type",
    selectOption: [
      { value: "max", label: "max" },
      { value: "min", label: "min" },
      { value: "max_rise", label: "max_rise" },
      { value: "min_rise", label: "min_rise" },
      { value: "max_fall", label: "max_fall" },
      { value: "min_fall", label: "min_fall" },
    ],
  },
  {
    key: "corner",
    label: "Corner",
  },
  {
    key: "sortBy",
    label: "Sort by",
    selectOption: [
      { value: "group", label: "group" },
      { value: "slack", label: "slack" },
    ],
  },
];

export const radioItems = [
  {
    label: "No line split",
    value: "noLineSplit",
  },
  {
    label: "Show net transition time",
    value: "netTransitionTime",
  },
  {
    label: "Show nets in combinational path",
    value: "netsInPath",
  },
  {
    label: "Show net capacitance",
    value: "netCapacitance",
  },
  {
    label: "Show unique paths to endpoint",
    value: "uniquePaths",
  },
  {
    label: "Show unconstrained path",
    value: "unconstrainedPath",
  },
];
