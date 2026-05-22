import styles from "./index.less";
import { hierarchyColumns } from "./const";
import { IDataType } from "@/components/ThorTable/interface";
import TreeTable from "@/components/TreeTable";
import { useEffect, useState } from "react";
import openTooltip from "@/utils/openTooltip";

const HierarchyBrowserPage = () => {
  const [hierarchyData, setHierarchyData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await window.electronAPI.request({
          type: "view:hierarchyBrowser",
        });

        if (res.data && Array.isArray(res.data)) {
          setHierarchyData(res.data);
        }
      } catch (error) {
        openTooltip("error", error as string);
      }
    };

    fetchData();
  }, []);

  const getContextMenu = (record: IDataType, event: React.MouseEvent) => {
    const targetElement = event.target as HTMLElement;
    const cellElement = targetElement.closest("td");

    let isHide = true; // 隐藏menu

    if (cellElement) {
      const textContent = cellElement.textContent?.trim();
      isHide = !textContent || textContent.trim() === "";
    }

    return [
      {
        key: "copy",
        title: "Copy Text",
        isHide: isHide,
      },
    ];
  };

  const handleMenuItemClick = (_: IDataType, event: React.MouseEvent) => () => {
    const targetElement = event.target as HTMLElement;
    const cellElement = targetElement.closest("td");

    if (cellElement) {
      const columnTitle = cellElement.getAttribute("title");
      if (columnTitle && columnTitle.trim()) {
        navigator.clipboard.writeText(columnTitle.trim());
      }
    }
  };

  return (
    <div className={styles["hierarchy-browser-container"]}>
      <TreeTable
        columns={hierarchyColumns as any[]}
        dataSource={hierarchyData}
        contextEvent={{
          menu: getContextMenu,
          onMenuItemClick: handleMenuItemClick,
        }}
      />
    </div>
  );
};

export default HierarchyBrowserPage;
