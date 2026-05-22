import { Typography } from "antd";

export const reportColumns = [
  {
    title: "full name",
    key: "fullName",
    dataIndex: "fullName",
    width: "120px",
    render: (text: string) => {
      let ellipsisText;
      const maxLength = 16;
      if (text.length <= maxLength) {
        ellipsisText = text;
      } else {
        const frontLength = Math.ceil(maxLength / 3);
        const endLength = maxLength - frontLength - 3;
        ellipsisText =
          text.substring(0, frontLength) +
          "..." +
          text.substring(text.length - endLength);
      }
      return (
        <Typography.Text title={text} ellipsis>
          {ellipsisText}
        </Typography.Text>
      );
    },
  },
  {
    title: "object class",
    key: "objectClass",
    dataIndex: "objectClass",
    width: "120px",
    ellipsis: true,
  },
  {
    title: "report",
    key: "report",
    dataIndex: "report",
    width: "120px",
    ellipsis: true,
  },
  {
    title: () => <div style={{ textAlign: "left" }}>required</div>,
    key: "required",
    dataIndex: "required",
    width: "120px",
    ellipsis: true,
    align: "right",
  },
  {
    title: () => <div style={{ textAlign: "left" }}>actual</div>,
    key: "actual",
    dataIndex: "actual",
    width: "120px",
    ellipsis: true,
    align: "right",
  },
  {
    title: () => <div style={{ textAlign: "left" }}>slack</div>,
    key: "slack",
    dataIndex: "slack",
    width: "120px",
    ellipsis: true,
    align: "right",
  },
  {
    title: "path group",
    key: "pathGroup",
    dataIndex: "pathGroup",
    width: "120px",
    ellipsis: true,
  },
];
