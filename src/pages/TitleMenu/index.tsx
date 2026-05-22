import { MailOutlined } from "@ant-design/icons";
import styles from "./index.less";
import { getTitleMenu } from "./const";
import { Dropdown } from "antd";
import { useState } from "react";
import { flexLayoutManager } from "@/mobx";
import ClockTreePage from "../components/ClockTree";
import { tabStore } from "@/mobx/TabStore";
import clockTree from "@/assets/Icon/clockTree.png";
import schematic from "@/assets/Icon/schematic.png";
import hierarchyIcon from "@/assets/Icon/hierarchyBrowser.png";
import generateReportIcon from "@/assets/Icon/generateReport.png";
import { terminalModel } from "@/mobx/Terminal";
import openTooltip from "@/utils/openTooltip";
import TopDesignPage from "../components/TopDesign";
import GenerateReportPage from "../components/GenerateReport";
import HierarchyBrowserPage from "../components/HierarchyBrowser";

const TitleMenu = () => {
  const [topOpenKey, setTopOpenKey] = useState<string>();
  const handleMenuClick = async (value: any) => {
    const { key } = value;
    switch (key) {
      case "liberty": {
        await window.electronCommon.openSubWindow("liberty");
        break;
      }
      case "netlist": {
        await window.electronCommon.openSubWindow("netlist");
        break;
      }
      case "sdc": {
        await window.electronCommon.openSubWindow("sdc");
        break;
      }
      case "lef": {
        await window.electronCommon.openSubWindow("lef");
        break;
      }
      case "def": {
        await window.electronCommon.openSubWindow("def");
        break;
      }
      case "spef_sdf": {
        await window.electronCommon.openSubWindow("spef_sdf");
        break;
      }
      case "application_variables": {
        await window.electronCommon.openSubWindow("application_variables");
        break;
      }
      case "hierarchy_browser": {
        flexLayoutManager.addNewTab(
          "Hier.1",
          <HierarchyBrowserPage />,
          "#mainArea",
          "hierarchyBrowser",

          <img src={hierarchyIcon} className={styles["custom-icon"]} />
        );
        break;
      }
      case "top_design_schematic_view": {
        let gaiaIdCounter = 0;
        const generateGaiaId = () => {
          return Date.now() + gaiaIdCounter++;
        };
        const newGaiaId = generateGaiaId();
        if (!flexLayoutManager.getTab("topDesign")) {
          flexLayoutManager.addNewTab(
            "Schematic_top",
            <TopDesignPage gaiaId={newGaiaId.toString()} />,
            "#mainArea",
            "topDesign",
            <img src={schematic} className={styles["custom-icon"]} />
          );
        } else {
          flexLayoutManager.switchToTab("topDesign");
        }
        break;
      }
      case "generate_report": {
        flexLayoutManager.addNewTab(
          "constraint_report_tmp",
          <GenerateReportPage />,
          "#mainArea",
          "generateReport",
          <img src={generateReportIcon} className={styles["custom-icon"]} />
        );
        break;
      }
      case "report_timing": {
        await window.electronCommon.openSubWindow("report_timing");
        break;
      }
      case "clock_tree": {
        if (!tabStore.getTabExists("rightArea")) {
          flexLayoutManager.maximizeTab("#mainArea");
        }
        tabStore.setTabExists("rightArea", true);
        if (!flexLayoutManager.getTab("clockTree")) {
          flexLayoutManager.addNewTab(
            "Clock Tree",
            <ClockTreePage />,
            "#rightArea",
            "clockTree",
            <img src={clockTree} className={styles["custom-icon"]} />
          );
        } else {
          flexLayoutManager.switchToTab("clockTree");
        }

        break;
      }
      case "export_tcl": {
        const exportTcl = terminalModel.orderHistory.filter(
          (item) => item.startsWith("read") || item.startsWith("start")
        );
        const { status, msg } = await window.electronCommon.showDialog(
          "write",
          "tcl",
          JSON.parse(JSON.stringify(exportTcl))
        );
        if (status === "failed") {
          openTooltip("error", msg as string);
        }
        break;
      }
      case "close_gui": {
        terminalModel.send("stop_gui");
        break;
      }
      case "exit": {
        await window.electronCommon.openSubWindow("exit");
        break;
      }
      case "insert_buffer": {
        await window.electronCommon.openSubWindow("insert_buffer");
        break;
      }
      case "size_cell": {
        await window.electronCommon.openSubWindow("size_cell");
        break;
      }
      case "remove_buffer": {
        await window.electronCommon.openSubWindow("remove_buffer");
        break;
      }
    }
  };
  const titleMenu = getTitleMenu();
  return (
    <div className={styles.titleBar}>
      <div className={styles.logo}>
        <MailOutlined />
      </div>
      {titleMenu.map((titleItem) => {
        return (
          <Dropdown
            menu={{ items: titleItem.menu, onClick: handleMenuClick }}
            key={titleItem.key}
            className={`${styles["title-dropdown"]} ${
              topOpenKey === titleItem.key ? styles.open : ""
            }`}
            onOpenChange={(open) => {
              if (open) {
                setTopOpenKey(titleItem.key);
              } else {
                setTopOpenKey("");
              }
            }}
          >
            <a onClick={(e) => e.preventDefault()}>{titleItem.label}</a>
          </Dropdown>
        );
      })}
    </div>
  );
};

export default TitleMenu;
