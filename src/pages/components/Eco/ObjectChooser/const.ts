export type SelectType = "net" | "pin" | "port";
interface Column {
  title: string;
  key: string;
  dataIndex: string;
}

export const TYPE_NAME: Record<SelectType, string> = {
  net: "netName",
  pin: "pinName",
  port: "portName",
};

export const COLUMN_CONFIG: Record<SelectType, Column> = {
  net: { title: "Net Name", key: "netName", dataIndex: "netName" },
  pin: { title: "Pin Name", key: "pinName", dataIndex: "pinName" },
  port: { title: "Port Name", key: "portName", dataIndex: "portName" },
};
