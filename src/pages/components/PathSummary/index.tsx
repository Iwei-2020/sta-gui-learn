import ThorTable from "@/components/ThorTable";
import styles from "./index.less";
import { firstColumns, secondColumns } from "./const";
import { Button, Spin } from "antd";
import { flexLayoutManager } from "@/mobx";
import PathInspectPage from "../PathInspect";
import { useEffect, useState } from "react";
import WaveformPage from "../Waveform";
import { tabStore } from "@/mobx/TabStore";
import schematic from "@/assets/Icon/schematic.png";
import waveform from "@/assets/Icon/waveform.png";
import pathInspect from "@/assets/Icon/pathInspect.png";
import { IDataType, ThorTableColumns } from "@/components/ThorTable/interface";
import { IPathInfo } from "../Waveform/interface";
import SchematicPage from "../Schematic";

interface IPathSummary {
  firstTableData: any[];
  winName: string;
}

const PathSummaryPage = (props: IPathSummary) => {
  //是否展示二级列表
  const [isShow, setIsShow] = useState<boolean>(false);
  const { firstTableData, winName } = props;
  const [secondTableData, setSecondTableData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedKey, setSelectedKey] = useState<number>();
  const [summaryId, setSummaryId] = useState<number>();
  const [singlePathInfo, setSinglePathInfo] = useState<IPathInfo>();
  const [pathIdList, setPathIdLsit] = useState<number[]>();

  useEffect(() => {
    if (secondTableData.length > 0) {
      setIsShow(true);
    }
  }, [secondTableData]);

  const hanldeFirstSelect = async (record: any) => {
    const rowKey = record[0].key;
    setSummaryId(rowKey);
    setIsLoading(true);
    try {
      // path summary二级列表接口请求
      const res = await window.electronAPI.request({
        type: "secondPathSummary",
        pathId: rowKey,
        winName,
      });
      if (res.data && Array.isArray(res.data)) {
        const tableData = res.data.map((item: any) => ({
          ...item,
          rowKey: item.key,
        }));
        setSecondTableData(tableData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSecondSelect = (selectedItems: any) => {
    // 当多选对象时，只对第一条数据生成 Paths Inspect View
    const firstSelectedKey = selectedItems[0].key;
    setSelectedKey(firstSelectedKey);
    const selectedKeys = selectedItems.map((item: any) => item.key);
    setPathIdLsit(selectedKeys);
    setSinglePathInfo({
      startpoint: selectedItems[0].startPoint,
      endpoint: selectedItems[0].endPoint,
      slack: selectedItems[0].slack,
    });
  };

  let gaiaIdCounter = 0;
  const generateGaiaId = () => {
    return Date.now() + gaiaIdCounter++;
  };

  const openSchematic = () => {
    if (!tabStore.getTabExists("rightArea")) {
      flexLayoutManager.maximizeTab("#mainArea");
    }
    tabStore.setTabExists("rightArea", true);
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
        <img src={schematic} className={styles["btn-icon"]} />
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
          <img src={schematic} className={styles["btn-icon"]} />
        );
      }, 0);
    }
  };

  const openWaveform = () => {
    if (!tabStore.getTabExists("rightArea")) {
      flexLayoutManager.maximizeTab("#mainArea");
    }
    tabStore.setTabExists("rightArea", true);
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
        <img src={waveform} className={styles["btn-icon"]} />
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
          <img src={waveform} className={styles["btn-icon"]} />
        );
      }, 0);
    }
  };

  const openInspectView = () => {
    if (!tabStore.getTabExists("rightArea")) {
      flexLayoutManager.maximizeTab("#mainArea");
    }
    tabStore.setTabExists("rightArea", true);
    if (!flexLayoutManager.getTab("pathInspect")) {
      flexLayoutManager.addNewTab(
        "Path Inspect",
        <PathInspectPage
          winName={winName}
          summaryId={summaryId as number}
          selectedKey={selectedKey as number}
          pathIdList={pathIdList as number[]}
          singlePathInfo={singlePathInfo as IPathInfo}
        />,
        "#rightArea",
        "pathInspect",
        <img src={pathInspect} className={styles["btn-icon"]} />
      );
    } else {
      flexLayoutManager.deleteTab("pathInspect");
      setTimeout(() => {
        flexLayoutManager.addNewTab(
          "Path Inspect",
          <PathInspectPage
            winName={winName}
            summaryId={summaryId as number}
            selectedKey={selectedKey as number}
            pathIdList={pathIdList as number[]}
            singlePathInfo={singlePathInfo as IPathInfo}
          />,
          "#rightArea",
          "pathInspect",
          <img src={pathInspect} className={styles["btn-icon"]} />
        );
      }, 0);
    }
  };

  const getRclickMenu = () => {
    return [
      {
        key: "schematic",
        icon: <img src={schematic} className={styles["btn-icon"]} />,
        title: "Schematic View",
      },
      {
        key: "waveform",
        icon: <img src={waveform} className={styles["btn-icon"]} />,
        title: "Waveform",
      },
      {
        key: "path-inspect",
        icon: <img src={pathInspect} className={styles["btn-icon"]} />,
        title: "Paths Inspect View",
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
      case "path-inspect": {
        openInspectView();
        break;
      }
    }
  };

  return (
    <div className={styles["summary-page"]}>
      <div className={styles[isShow ? "first-summary" : "summary-area"]}>
        <ThorTable
          columns={firstColumns as ThorTableColumns}
          dataSource={firstTableData}
          selectionMode="single"
          handleSelect={(selectedKey) => hanldeFirstSelect(selectedKey)}
        />
      </div>
      {isLoading && !isShow && (
        <Spin size="small" className={styles["second-summary"]} />
      )}
      {isShow && (
        <div className={styles["second-summary"]}>
          <div className={styles["second-table"]}>
            <ThorTable
              columns={secondColumns as ThorTableColumns}
              dataSource={secondTableData as any[]}
              selectionMode="multi"
              handleSelect={(selectedItems) =>
                handleSecondSelect(selectedItems)
              }
              contextEvent={{
                menu: getRclickMenu(),
                onMenuItemClick: (record) => (menuItem) => {
                  handleMenuClick(record, menuItem.key);
                },
              }}
            />
          </div>
          <div className={styles["summary-btns"]}>
            <Button
              className={styles["schematic-btn"]}
              icon={<img src={schematic} className={styles["btn-icon"]} />}
              onClick={openSchematic}
              disabled={summaryId === undefined || selectedKey === undefined}
            >
              Schematic
            </Button>
            <Button
              className={styles["waveform-btn"]}
              onClick={openWaveform}
              icon={<img src={waveform} className={styles["btn-icon"]} />}
              disabled={summaryId === undefined || selectedKey === undefined}
            >
              Waveform
            </Button>
            <Button
              className={styles["inspect-btn"]}
              onClick={openInspectView}
              icon={<img src={pathInspect} className={styles["btn-icon"]} />}
              disabled={summaryId === undefined || selectedKey === undefined}
            >
              Inspect
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PathSummaryPage;
