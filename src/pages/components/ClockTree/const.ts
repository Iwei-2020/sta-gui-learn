export const clockColumns = [
  {
    title: "Clocks",
    key: "clocks",
    dataIndex: "clocks",
    width: "189px",
    ellipsis: true,
    render: (text: string) => {
      if (!text) return text;
      const maxLength = 16;

      if (text.length <= maxLength) return text;

      const frontLength = Math.ceil(maxLength / 3);
      const endLength = maxLength - frontLength - 3;

      return (
        text.substring(0, frontLength) +
        "..." +
        text.substring(text.length - endLength)
      );
    },
  },
  {
    title: "Period",
    key: "period",
    dataIndex: "period",
    width: "78px",
    ellipsis: true,
  },
  {
    title: "Waveform",
    key: "waveform",
    dataIndex: "waveform",
    width: "88px",
    ellipsis: true,
  },
  {
    title: "Propogated",
    key: "propogated",
    dataIndex: "propogated",
    width: "100px",
    ellipsis: true,
    render: (propogated: boolean) => {
      return String(propogated);
    },
  },
  {
    title: "Sources",
    key: "sources",
    dataIndex: "sources",
    width: "100px",
    ellipsis: true,
  },
  {
    title: "Type",
    key: "type",
    dataIndex: "type",
    width: "78px",
    ellipsis: true,
  },
  {
    title: "Active",
    key: "active",
    dataIndex: "active",
    width: "78px",
    ellipsis: true,
    render: (active: boolean) => {
      return String(active);
    },
  },
];

// mock
export const clockData: any[] = [
  {
    key: "1",
    rowKey: "1",
    clocks: "core_clock",
    period: "0.46",
    waveform: "{0 0.23}",
    propogated: "false",
    sources: "clk",
    type: "primary",
    active: "true",
  },

  {
    key: "2",
    rowKey: "2",
    clocks: "core_clock",
    period: "0.46",
    waveform: "{0 0.23}",
    propogated: "false",
    sources: "clk",
    type: "primary",
    active: "true",
  },
  {
    key: "3",
    rowKey: "3",
    clocks: "core_clock",
    period: "0.46",
    waveform: "{0 0.23}",
    propogated: "false",
    sources: "clk",
    type: "primary",
    active: "true",
    children: [
      {
        key: "3-1",
        rowKey: "3-1",
        clocks: "dapth/b_re...",
        period: "0.46",
        waveform: "{0 0.23}",
        propogated: "false",
        sources: "clk",
        type: "primary",
        active: "true",
      },
    ],
  },
];
