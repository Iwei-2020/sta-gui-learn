export const hierarchyColumns = [
  {
    title: "Logical Hierarchy",
    key: "logicalHierarchy",
    dataIndex: "logicalHierarchy",
    width: "560px",
  },
  {
    title: "Module",
    key: "module",
    dataIndex: "module",
    width: "310px",
    ellipsis: true,
  },
  {
    title: () => <div style={{ textAlign: "left" }}>Pin Count</div>,
    key: "pinCount",
    dataIndex: "pinCount",
    width: "155px",
    ellipsis: true,
    align: "right",
  },
  {
    title: () => <div style={{ textAlign: "left" }}>Hier Cell Count</div>,
    key: "hierCellCount",
    dataIndex: "hierCellCount",
    width: "155px",
    ellipsis: true,
    align: "right",
  },
];
