import styles from "./index.less";
import { reportColumns } from "./const";
import { useEffect, useState } from "react";
import openTooltip from "@/utils/openTooltip";
import GenerateReportTable from "@/components/GenerateReportTable";
import {
  GenerateReportColumns,
  ITableType,
} from "@/components/GenerateReportTable/interface";

const GenerateReportPage = () => {
  const [generateReportData, setGenerateReportData] = useState<ITableType[]>(
    []
  );

  const getContextMenu = (_: ITableType, event: React.MouseEvent) => {
    const targetElement = event.target as HTMLElement;
    const cellElement = targetElement.closest("td");

    let isHide = true; // 隐藏menu

    if (cellElement) {
      const columnTitle = cellElement.getAttribute("title");
      isHide = !columnTitle || columnTitle.trim() === "";
    }

    return [
      {
        key: "copy",
        title: "Copy Text",
        isHide: isHide,
      },
    ];
  };

  const handleMenuItemClick =
    (_: ITableType, event: React.MouseEvent) => () => {
      const targetElement = event.target as HTMLElement;
      const cellElement = targetElement.closest("td");

      if (cellElement) {
        const columnTitle = cellElement.getAttribute("title");
        if (columnTitle && columnTitle.trim()) {
          navigator.clipboard.writeText(columnTitle.trim());
        }
      }
    };

  useEffect(() => {
    // todo:report interface
    const fetchData = async () => {
      try {
        const res = await window.electronAPI.request({
          type: "report:generateReport",
        });

        if (res.data && Array.isArray(res.data)) {
          setGenerateReportData(res.data);
        }
      } catch (error) {
        openTooltip("error", error as string);
      }
    };

    fetchData();
  }, []);

  return (
    <div className={styles["generate-report"]}>
      <GenerateReportTable
        columns={reportColumns as GenerateReportColumns}
        dataSource={generateReportData}
        contextEvent={{
          menu: getContextMenu,
          onMenuItemClick: handleMenuItemClick,
        }}
      />
    </div>
  );
};

export default GenerateReportPage;
