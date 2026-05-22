import pointColor from "@/assets/Icon/pointColor.png";
import { Typography } from "antd";
export const pointColumns = [
  {
    title: "Point",
    key: "point",
    dataIndex: "point",
    width: "200px",
    render: (text: string) => {
      const maxLength = 6;
      let ellipsisText = text;

      if (text.length > maxLength) {
        const endLength = maxLength;
        const startIndex = text.length - endLength;
        ellipsisText = `...${text.substring(startIndex)}`;
      }

      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            whiteSpace: "nowrap",
          }}
        >
          <img
            src={pointColor}
            style={{
              width: "12px",
              height: "12px",
              marginRight: "6px",
            }}
          />
          <Typography.Text title={text} ellipsis>
            {ellipsisText}
          </Typography.Text>
        </div>
      );
    },
  },
  {
    title: () => <div style={{ textAlign: "left" }}>Path</div>,
    key: "path",
    dataIndex: "path",
    width: "160px",
    ellipsis: true,
    align: "right",
  },
  {
    title: () => <div style={{ textAlign: "left" }}>Incr</div>,
    key: "incr",
    dataIndex: "incr",
    width: "160px",
    ellipsis: true,
    align: "right",
  },
  {
    title: "Trans",
    key: "trans",
    dataIndex: "trans",
    width: "160px",
    ellipsis: true,
  },
  {
    title: "RefCell",
    key: "refCell",
    dataIndex: "refCell",
    width: "180px",
    ellipsis: true,
  },
  {
    title: "Fanout",
    key: "fanout",
    dataIndex: "fanout",
    width: "160px",
    ellipsis: true,
  },
  {
    title: "Cap",
    key: "cap",
    dataIndex: "cap",
    ellipsis: true,
  },
];
