import { ConfigProvider, Splitter } from "antd";
import styles from "./index.less";
import TitleMenu from "./TitleMenu";
import TerminalPanel from "./TerminalPanel";
import MainContent from "./MainContent";
import { observer } from "mobx-react";
import { useEffect, useRef, useState } from "react";
import { flexLayoutManager } from "@/mobx";
import PathSummaryPage from "./components/PathSummary";
import openTooltip from "@/utils/openTooltip";
import { tabStore } from "@/mobx/TabStore";
import pathSummary from "@/assets/Icon/pathSummary.png";
import { terminalModel } from "@/mobx/Terminal";
import { titleMenuStore } from "@/mobx/TitleMenuStore";

const HomePage: React.FC = observer(() => {
  const [firstTableData, setFirstTableData] = useState<any[]>([]);
  const [winName, setWinName] = useState<string>("");
  const iRef = useRef(0);

  useEffect(() => {
    flexLayoutManager.addNewTab(
      "Path Summary",
      <PathSummaryPage firstTableData={firstTableData} winName={winName} />,
      "#mainArea",
      "init-path-summary",
      <img src={pathSummary} className={styles["pathSummary-icon"]} />
    );
    if (!tabStore.getTabExists("rightArea")) {
      flexLayoutManager.maximizeTab("#mainArea");
    }

    const channel = new BroadcastChannel("path-summary");
    const handler = (event: any) => {
      const formData = event.data.formValues;

      // winName唯一性
      iRef.current += 1;
      const newWinName = `${event.data.winName}.${iRef.current}`;
      setWinName(newWinName);
      formData.reportOptions.winName = newWinName;

      const fetchData = async () => {
        // path summary一级列表接口请求
        try {
          const res = await window.electronAPI.request({
            type: "firstPathSummary",
            ...formData,
          });
          if (res.data && Array.isArray(res.data)) {
            const tableData = res.data.map((item: any) => ({
              ...item,
              rowKey: item.key,
            }));
            setFirstTableData(tableData);
          } else {
            openTooltip("warning", "No Path Summary Data!");
          }
        } catch (error) {
          openTooltip("error", `Fetch Path Summary Data Erorr: ${error}`);
        }
      };
      fetchData();
    };

    channel.addEventListener("message", handler);
    return () => channel.removeEventListener("message", handler);
  }, []);

  useEffect(() => {
    if (firstTableData && firstTableData.length > 0) {
      const initTab = flexLayoutManager.isTabValid("init-path-summary");
      if (initTab) {
        flexLayoutManager.deleteTab("init-path-summary");
      }
      flexLayoutManager.addNewTab(
        winName,
        <PathSummaryPage firstTableData={firstTableData} winName={winName} />,
        "#mainArea",
        winName, //tabId
        <img src={pathSummary} className={styles["pathSummary-icon"]} />
      );
    }
  }, [firstTableData]);

  let globalTimingChannel: BroadcastChannel | null = null;

  useEffect(() => {
    const timingDisabled = titleMenuStore.isDisabled("report_timing");
    globalTimingChannel = new BroadcastChannel("timing-state");
    // 初始主动传送timingDisabled值
    globalTimingChannel.postMessage({
      type: "report-timing-state",
      timingDisabled: timingDisabled,
    });

    //  确保再次打开窗体时重新传递timingDisaled值
    const handleRequest = (event: MessageEvent) => {
      if (event.data.type === "request-current-timing-state") {
        if (globalTimingChannel) {
          globalTimingChannel.postMessage({
            type: "report-timing-state",
            timingDisabled: timingDisabled,
          });
        }
      }
    };
    globalTimingChannel.addEventListener("message", handleRequest);

    return () => {
      if (globalTimingChannel) {
        globalTimingChannel.removeEventListener("message", handleRequest);
        globalTimingChannel.close();
      }
    };
  }, [terminalModel.orderHistory]);

  return (
    <ConfigProvider
      theme={{
        components: { Splitter: { splitBarSize: 4, splitTriggerSize: 8 } },
      }}
    >
      <div className={styles.page}>
        <TitleMenu />
        <Splitter layout="vertical">
          <Splitter.Panel>
            <MainContent />
          </Splitter.Panel>
          <Splitter.Panel defaultSize={180}>
            <TerminalPanel />
          </Splitter.Panel>
        </Splitter>
      </div>
    </ConfigProvider>
  );
});

export default HomePage;
