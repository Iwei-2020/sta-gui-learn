import { app } from "electron";

export const APP_ENV = app.commandLine.hasSwitch("development")
  ? "development"
  : "production";

process.env.APP_WEBSERVER_PORT =
  app.commandLine.getSwitchValue("webserver-port") ?? 10000;

const args = process.argv;
const portIndex = args.indexOf("-p");
export const APP_SOCKET_PORT =
  portIndex !== -1 && portIndex + 1 < args.length ? args[portIndex + 1] : 9999;

const filesWindowMenu = [
  {
    id: "liberty",
    property: {
      url: "/liberty",
      title: "Liberty",
      width: 336,
      minWidth: 336,
      maxWidth: 336,
      height: 320,
      minHeight: 320,
      maxHeight: 320,
    },
  },
  {
    id: "netlist",
    property: {
      url: "/netlist",
      title: "Netlist",
      width: 336,
      minWidth: 336,
      maxWidth: 336,
      height: 320,
      minHeight: 320,
      maxHeight: 320,
    },
  },
  {
    id: "def",
    property: {
      url: "/def",
      title: "Def",
      width: 336,
      minWidth: 336,
      maxWidth: 336,
      height: 320,
      minHeight: 320,
      maxHeight: 320,
    },
  },
  {
    id: "lef",
    property: {
      url: "/lef",
      title: "Lef",
      width: 336,
      minWidth: 336,
      maxWidth: 336,
      height: 320,
      minHeight: 320,
      maxHeight: 320,
    },
  },
  {
    id: "spef_sdf",
    property: {
      url: "/spefsdf",
      title: "Spef/Sdf",
      width: 336,
      minWidth: 336,
      maxWidth: 336,
      height: 320,
      minHeight: 320,
      maxHeight: 320,
    },
  },
  {
    id: "sdc",
    property: {
      url: "/sdc",
      title: "SDC",
      width: 336,
      minWidth: 336,
      maxWidth: 336,
      height: 126,
      minHeight: 126,
      maxHeight: 126,
    },
  },
  {
    id: "application_variables",
    property: {
      url: "/application",
      title: "Application Variables",
      width: 530,
      minWidth: 530,
      maxWidth: 530,
      height: 464,
      minHeight: 464,
      maxHeight: 464,
    },
  },
];

const exitWin = [
  {
    id: "exit",
    property: {
      url: "/exit",
      title: "Exit",
      width: 394,
      minWidth: 394,
      maxWidth: 394,
      height: 106,
      minHeight: 106,
      maxHeight: 106,
    },
  },
];

const ecoWin = [
  {
    id: "insert_buffer",
    property: {
      url: "/eco/insertBuffer",
      title: "Insert Buffer",
      width: 480,
      minWidth: 480,
      maxWidth: 480,
      height: 216,
      minHeight: 216,
      maxHeight: 304,
    },
  },
  {
    id: "object_chooser",
    property: {
      url: "/eco/objectChooser",
      title: "Object Chooser",
      width: 480,
      minWidth: 480,
      maxWidth: 480,
      height: 619,
      minHeight: 619,
      maxHeight: 619,
    },
  },
  {
    id: "size_cell",
    property: {
      url: "/eco/sizeCell",
      title: "Size Cell",
      width: 480,
      minWidth: 480,
      maxWidth: 480,
      height: 120,
      minHeight: 120,
      maxHeight: 120,
    },
  },
  {
    id: "remove_buffer",
    property: {
      url: "/eco/removeBuffer",
      title: "Remove Buffer",
      width: 480,
      minWidth: 480,
      maxWidth: 480,
      height: 120,
      minHeight: 120,
      maxHeight: 120,
    },
  },
];

export const windowMenuData = [
  ...filesWindowMenu,
  ...exitWin,
  {
    id: "report_timing",
    property: {
      url: "/report/timingPaths",
      title: "Report Timing Paths",
      width: 662,
      minWidth: 662,
      maxWidth: 662,
      height: 664,
      minHeight: 664,
      maxHeight: 728,
    },
  },
  ...ecoWin,
];
