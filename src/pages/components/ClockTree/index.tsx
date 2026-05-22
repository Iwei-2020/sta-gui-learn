import ThorTable from "@/components/ThorTable";
import styles from "./index.less";
import { clockColumns } from "./const";
import { useEffect, useState } from "react";
import openTooltip from "@/utils/openTooltip";
import generatedIcon from "@/assets/Icon/generated.png";
import masterIcon from "@/assets/Icon/master.png";
import virtualIcon from "@/assets/Icon/virtual.png";

const iconMap: Record<string, string> = {
  M: masterIcon,
  G: generatedIcon,
  V: virtualIcon,
};

const ClockTreePage = () => {
  const [clockData, setClockData] = useState<any[]>([]);
  const [finalColumns, setFinalColumns] = useState<any[]>(clockColumns);
  useEffect(() => {
    const fetchClockData = async () => {
      try {
        const res = await window.electronAPI.request({
          type: "clockTree",
        });

        if (res.data && Array.isArray(res.data)) {
          const processedData = res.data.map((item) => ({
            ...item,
            children:
              item.children && item.children.length > 0
                ? item.children
                : undefined,
          }));

          setClockData(processedData);
        }
      } catch (error) {
        openTooltip("error", error as string);
      }
    };

    fetchClockData();
  }, []);

  useEffect(() => {
    setFinalColumns((prevColumns) => {
      const newColumns = [...prevColumns];
      newColumns[0] = {
        ...newColumns[0],
        render: (text: string) => (
          <div>
            {clockData.map((item) => {
              return (
                item.clockType && (
                  <img
                    key={item.key}
                    src={iconMap[item.clockType]}
                    className={styles["point-icon"]}
                  />
                )
              );
            })}
            {text}
          </div>
        ),
      };
      return newColumns;
    });
  }, [clockData]);
  return (
    <div className={styles["clock-page"]}>
      <ThorTable
        selectionMode="multi"
        columns={finalColumns}
        dataSource={clockData}
      />
    </div>
  );
};

export default ClockTreePage;
