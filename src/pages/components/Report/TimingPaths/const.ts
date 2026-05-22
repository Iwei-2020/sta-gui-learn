export const THROUGH_HEIGHT = 32;
export const chooserOptions = [
  {
    label: "From",
    pathType: "fromChooserPath",
    type: "fromChooserType",
    value: "fromChooserValue",
    options: [
      { value: "from", label: "From" },
      { value: "riseFrom", label: "Rise From" },
      { value: "fallFrom", label: "Fall From" },
    ],
    isRemovable: false,
  },
  {
    label: "To",
    pathType: "toChooserPath",
    type: "toChooserType",
    value: "toChooserValue",
    options: [
      { value: "to", label: "To" },
      { value: "riseTo", label: "Rise To" },
      { value: "fallTo", label: "Fall To" },
    ],
    isRemovable: false,
  },
  {
    label: "Through",
    pathType: "throughChooserPath",
    type: "throughChooserType",
    value: "throughChooserValue",
    options: [
      { value: "through", label: "Through" },
      { value: "riseThrough", label: "Rise Through" },
      { value: "fallThrough", label: "Fall Through" },
    ],
    isRemovable: false,
  },
];
