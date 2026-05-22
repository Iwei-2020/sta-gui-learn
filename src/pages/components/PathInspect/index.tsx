import { Button } from "antd";
import styles from "./index.less";
import ThorTable from "@/components/ThorTable";
import { pointColumns } from "./const";
import { useEffect, useState } from "react";
import { flexLayoutManager } from "@/mobx";
import schematic from "@/assets/Icon/schematic.png";
import waveform from "@/assets/Icon/waveform.png";
import pinSource from "@/assets/Icon/pinSource.png";
import { observer } from "mobx-react";
import WaveformPage from "../Waveform";
import { IDataType, ThorTableColumns } from "@/components/ThorTable/interface";
import { IPathInfo } from "../Waveform/interface";
import SchematicPage from "../Schematic";

interface IPathInspect {
  winName: string;
  summaryId: number;
  selectedKey: number;
  pathIdList: number[];
  singlePathInfo: IPathInfo;
}

const PathInspectPage = observer((props: IPathInspect) => {
  const { winName, summaryId, selectedKey, pathIdList, singlePathInfo } = props;

  const isValid = flexLayoutManager.isTabValid(winName);
  const isDisabled = !isValid;
  const [pathInfo, setPathInfo] = useState<string>("");
  const [pathData, setPathData] = useState<string>("");
  const [tableData, setTableData] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const inspectRes = await window.electronAPI.request({
        type: "pathInspect",
        summaryId,
        pathId: selectedKey,
        winName,
      });
      if (inspectRes.data) {
        setPathInfo(inspectRes.data.pathInfo as string);
        setPathData(inspectRes.data.pathData as string);
        const pointTable = inspectRes.data.pointTable as any[];
        if (Array.isArray(pointTable)) {
          const addRowKey = (nodes: any[]): any[] => {
            return nodes.map((item) => {
              const newItem = {
                ...item,
                rowKey: item.key,
              };

              if (item.children && Array.isArray(item.children)) {
                newItem.children = addRowKey(item.children);
              }

              return newItem;
            });
          };

          const data = addRowKey(pointTable);
          setTableData(data);
        }
      }
    };
    fetchData();
  }, []);

  const switchTab = () => {
    if (isValid) {
      flexLayoutManager.switchToTab(winName);
    }
  };

  let gaiaIdCounter = 0;
  const generateGaiaId = () => {
    return Date.now() + gaiaIdCounter++;
  };

  const openSchematic = () => {
    const newGaiaId = generateGaiaId();
    if (!flexLayoutManager.getTab("schematic")) {
      flexLayoutManager.addNewTab(
        "Schematic",
        <SchematicPage
          gaiaId={newGaiaId.toString()}
          winName={winName}
          summaryId={summaryId as number}
          pathIdList={pathIdList as number[]}
        />,
        "#rightArea",
        "schematic",
        <img src={schematic} className={styles["schematic-icon"]} />
      );
    } else {
      flexLayoutManager.deleteTab("schematic");
      setTimeout(() => {
        flexLayoutManager.addNewTab(
          "Schematic",
          <SchematicPage
            gaiaId={newGaiaId.toString()}
            winName={winName}
            summaryId={summaryId as number}
            pathIdList={pathIdList as number[]}
          />,
          "#rightArea",
          "schematic",
          <img src={schematic} className={styles["schematic-icon"]} />
        );
      }, 0);
    }
  };

  const openWaveform = () => {
    if (!flexLayoutManager.getTab("waveform")) {
      flexLayoutManager.addNewTab(
        "Waveform",
        <WaveformPage
          winName={winName}
          summaryId={summaryId as number}
          pathId={selectedKey as number}
          singlePathInfo={singlePathInfo as IPathInfo}
        />,
        "#rightArea",
        "waveform",
        <img src={waveform} className={styles["waveform-icon"]} />
      );
    } else {
      flexLayoutManager.deleteTab("waveform");
      setTimeout(() => {
        flexLayoutManager.addNewTab(
          "Waveform",
          <WaveformPage
            winName={winName}
            summaryId={summaryId as number}
            pathId={selectedKey as number}
            singlePathInfo={singlePathInfo as IPathInfo}
          />,
          "#rightArea",
          "waveform",
          <img src={waveform} className={styles["waveform-icon"]} />
        );
      }, 0);
    }
  };

  const getRclickMenu = () => {
    return [
      {
        key: "schematic",
        icon: <img src={schematic} className={styles["schematic-icon"]} />,
        title: "Path Schematic",
      },
      {
        key: "waveform",
        icon: <img src={waveform} className={styles["waveform-icon"]} />,
        title: "Waveform",
      },
    ];
  };

  const handleMenuClick = (record: IDataType, key: string) => {
    switch (key) {
      case "schematic": {
        openSchematic();
        break;
      }
      case "waveform": {
        openWaveform();
        break;
      }
    }
  };

  return (
    <div className={styles["inspect-page"]}>
      <Button
        className={styles["summary-btn"]}
        onClick={switchTab}
        disabled={isDisabled}
      >
        {winName}
        <img src={pinSource} className={styles["schematic-icon"]} />
      </Button>
      <div className={styles["info1-div"]}>
        <pre>{pathInfo}</pre>
      </div>
      <div className={styles["point-table"]}>
        <ThorTable
          selectionMode="multi"
          columns={pointColumns as ThorTableColumns}
          dataSource={tableData}
          contextEvent={{
            menu: getRclickMenu(),
            onMenuItemClick: (record) => (menuItem) => {
              handleMenuClick(record, menuItem.key);
            },
          }}
        />
      </div>

      <div className={styles["info2-div"]}>
        <pre>{pathData}</pre>
      </div>
      <div className={styles["footer-btns"]}>
        <Button
          className={styles["schematic-btn"]}
          icon={<img src={schematic} className={styles["schematic-icon"]} />}
          onClick={openSchematic}
        >
          Schematic
        </Button>
        <Button
          className={styles["waveform-btn"]}
          icon={<img src={waveform} className={styles["waveform-icon"]} />}
          onClick={openWaveform}
        >
          Waveform
        </Button>
      </div>
    </div>
  );
});

export default PathInspectPage;
