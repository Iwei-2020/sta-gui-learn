import { MenuProps } from "antd";
import importFile from "@/assets/Icon/importFile.png";
import exportIcon from "@/assets/Icon/exportIcon.png";
import clockTree from "@/assets/Icon/clockTree.png";
import styles from "./index.less";
import { titleMenuStore } from "@/mobx/TitleMenuStore";
import applicationIcon from "@/assets/Icon/applicationVariables.png";
import insertBufferIcon from "@/assets/Icon/insertBuffer.png";
import removeBufferIcon from "@/assets/Icon/removeBuffer.png";
import sizeCellIcon from "@/assets/Icon/sizeCell.png";
import hierarchyIcon from "@/assets/Icon/hierarchyBrowser.png";
import generateReportIcon from "@/assets/Icon/generateReport.png";

const getFileMenu = (): MenuProps["items"] => {
  return [
    {
      key: "liberty",
      icon: <img src={importFile} className={styles["import-icon"]} />,
      label: "Liberty...",
      className: "custom-sub-item",
    },
    {
      key: "netlist",
      icon: (
        <img
          src={importFile}
          className={`${
            titleMenuStore.isDisabled("netlist")
              ? styles["icon-disabled"]
              : styles["import-icon"]
          }`}
        />
      ),
      label: "NetList...",
      className: "custom-sub-item",
      disabled: titleMenuStore.isDisabled("netlist"),
    },
    {
      key: "sdc",
      icon: (
        <img
          src={importFile}
          className={`${
            titleMenuStore.isDisabled("sdc")
              ? styles["icon-disabled"]
              : styles["import-icon"]
          }`}
        />
      ),
      label: "SDC...",
      className: "custom-sub-item",
      disabled: titleMenuStore.isDisabled("sdc"),
    },
    {
      key: "def",
      icon: (
        <img
          src={importFile}
          className={`${
            titleMenuStore.isDisabled("def")
              ? styles["icon-disabled"]
              : styles["import-icon"]
          }`}
        />
      ),
      label: "Def...",
      className: "custom-sub-item",
      disabled: titleMenuStore.isDisabled("def"),
    },
    {
      key: "spef_sdf",
      icon: (
        <img
          src={importFile}
          className={`${
            titleMenuStore.isDisabled("spef_sdf")
              ? styles["icon-disabled"]
              : styles["import-icon"]
          }`}
        />
      ),
      label: "Spef/Sdf...",
      className: "custom-sub-item",
      disabled: titleMenuStore.isDisabled("spef_sdf"),
    },
    { type: "divider" },
    {
      key: "application_variables",
      icon: <img src={applicationIcon} className={styles["import-icon"]} />,
      label: "Application Variables",
      className: "custom-sub-item",
    },
    { type: "divider" },
    {
      key: "export_tcl",
      icon: <img src={exportIcon} className={styles["import-icon"]} />,
      label: "Export TCL Script",
      className: "custom-sub-item",
    },
    { type: "divider" },
    {
      key: "close_gui",
      label: <div style={{ marginLeft: "22px" }}>Close GUI</div>,
      className: "custom-sub-item",
    },
    {
      key: "exit",
      label: <div style={{ marginLeft: "22px" }}>Exit</div>,
      className: "custom-sub-item",
    },
  ];
};

const getEcoMenu = (): MenuProps["items"] => {
  return [
    {
      key: "insert_buffer",
      label: "Insert Buffer",
      icon: <img src={insertBufferIcon} className={styles["custom-icon"]} />,
      className: "custom-sub-item",
      disabled: titleMenuStore.isDisabled("report_timing"),
    },
    {
      key: "size_cell",
      label: "Size Cell",
      className: "custom-sub-item",
      icon: <img src={sizeCellIcon} className={styles["custom-icon"]} />,
      disabled: titleMenuStore.isDisabled("report_timing"),
    },
    {
      key: "remove_buffer",
      label: "Remove Buffer",
      className: "custom-sub-item",
      icon: <img src={removeBufferIcon} className={styles["custom-icon"]} />,
      disabled: titleMenuStore.isDisabled("report_timing"),
    },
    // {
    //   key: "redo",
    //   label: "Redo",
    //   className: "custom-sub-item",
    //   disabled: true,
    // },
    // {
    //   key: "undo",
    //   label: "Undo",
    //   className: "custom-sub-item",
    //   disabled: true,
    // },
  ];
};

export const getTitleMenu = () => {
  return [
    {
      key: "file",
      label: "File",
      menu: getFileMenu(),
    },
    {
      key: "view",
      label: "View",
      menu: [
        {
          key: "hierarchy_browser",
          label: "Hierarchy Browser",
          className: "custom-sub-item",
          icon: <img src={hierarchyIcon} className={styles["custom-icon"]} />,
          disabled: titleMenuStore.isDisabled("report_timing"),
        },
      ],
    },
    {
      key: "schematic",
      label: "Schematic",
      menu: [
        {
          key: "top_design_schematic_view",
          label: "Top Design Schematic View",
          className: "custom-sub-item",
          disabled:
            titleMenuStore.isDisabled("top_schematic") ||
            titleMenuStore.isDisabled("report_timing"),
        },
      ],
    },
    {
      key: "report",
      label: "Report",
      menu: [
        {
          key: "generate_report",
          label: 'Generate "All Constraint Violation" Report',
          className: "custom-sub-item",
          icon: (
            <img src={generateReportIcon} className={styles["custom-icon"]} />
          ),
          disabled: titleMenuStore.isDisabled("report_timing"),
        },
      ],
    },
    {
      key: "timing",
      label: "Timing",
      menu: [
        {
          key: "report_timing",
          label: "Report Timing Paths",
          className: "custom-sub-item",
          onClick: () => {
            titleMenuStore.setDisabled(["timing_ok"], false);
          },
        },
      ],
    },
    {
      key: "clock",
      label: "Clock",
      menu: [
        {
          key: "clock_tree",
          icon: <img src={clockTree} className={styles["custom-icon"]} />,
          label: "Clock Tree",
          className: "custom-sub-item",
        },
      ],
    },
    {
      key: "eco",
      label: "ECO",
      menu: getEcoMenu(),
    },
  ];
};
