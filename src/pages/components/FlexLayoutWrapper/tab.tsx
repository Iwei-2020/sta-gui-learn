import { TabNode } from "flexlayout-react";

const Tab = ({ node }: { node: TabNode }) => {
  return <div style={{ height: "100%" }}>{node.getConfig().content}</div>;
};

export default Tab;
