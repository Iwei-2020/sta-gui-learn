import { Dropdown, Tree, TreeDataNode } from "antd";
import { useCallback, useEffect, useState } from "react";
import styles from "./index.less";
import { hierarchyModel } from "@/mobx";

interface IHierarchyProps {
  handleSelect?: (path: string) => void;
}

const HierarchyPage: React.FC<IHierarchyProps> = (props) => {
  const { handleSelect } = props;
  const [selectedKeys, setSelectedKeys] = useState<React.Key[]>([]);

  const onSelect = (curSelectedKeys: React.Key[], e: any) => {
    // 去除取消选中点击逻辑
    if (e.node.key === selectedKeys[0]) return;
    const curKey = curSelectedKeys[0] as string;
    hierarchyModel.updateHierarchySelectedIcon({
      handle_name: curKey,
      name: e.node.title,
    });
    handleSelect?.(curKey);
  };

  // todo:hierarchy data interface
  useEffect(() => {
    const getHierarchyData = async () => {
      //   await window.electronAPI.request({ type: "hierarchy" });
    };

    getHierarchyData();
  }, []);

  //   useEffect(() => {
  //     const topNode = hierarchyModel.topHierarchy;
  //     hierarchyModel.updateHierarchySelectedIcon(topNode);
  //   }, [hierarchyModel.topHierarchy]);

  //   useEffect(() => {
  //     if (hierarchyModel.hierarchySelected || hierarchyModel.leafSelected) {
  //       setSelectedKeys([
  //         hierarchyModel.leafSelected?.handle_name ??
  //           hierarchyModel.hierarchySelected?.handle_name ??
  //           "",
  //       ]);
  //     } else {
  //       setSelectedKeys([]);
  //     }
  //   }, [hierarchyModel.hierarchySelected, hierarchyModel.leafSelected]);

  const renderHierarchy = useCallback(
    (width: number | string) => (
      <div className={styles["hierarchy-container"]} style={{ width }}>
        <Tree
          className={styles.tree}
          treeData={hierarchyModel.hierarchyTree}
          selectedKeys={selectedKeys}
          onSelect={onSelect}
          blockNode
          showLine
        />
      </div>
    ),
    [hierarchyModel.hierarchyTree, selectedKeys, onSelect]
  );
  return (
    <div style={{ display: "flex", height: "100%" }}>
      {renderHierarchy("100%")}
    </div>
  );
};

export default HierarchyPage;
