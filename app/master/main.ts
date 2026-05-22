import {
  BrowserWindow,
  IpcMainInvokeEvent,
  Menu,
  app,
  dialog,
  ipcMain,
} from "electron";
import { WindoManagerInstance, WindowOptions } from "./utils/windowManager";
import fs from "fs";
import path from "path";
import { APP_ENV, APP_SOCKET_PORT } from "./common/constants";

let mainWindow: BrowserWindow | null = null;
app.whenReady().then(async () => {
  if (APP_ENV === "development") {
    // todo
  } else {
    const { createServer } = require("http-server");
    const server = createServer({
      root: `${__dirname}/../bundled/`,
    });
    const launchServer = (): Promise<string> => {
      return new Promise((resolve) => {
        server.listen(0, () => {
          resolve(server.server.address().port);
        });
      });
    };
    process.env.APP_WEBSERVER_PORT = await launchServer();
  }

  mainWindow = await WindoManagerInstance.createMainWindow({
    title: "STA",
    width: 1440,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      devTools: APP_ENV === "development",
      nodeIntegration: true,
      contextIsolation: true,
      sandbox: false,
      additionalArguments: [`--port=${APP_SOCKET_PORT}`],
    },
    show: true,
    url: `http://localhost:${process.env.APP_WEBSERVER_PORT}/`,
  });

  ipcMain.handle("socket-port", () => {
    return { port: APP_ENV === "development" ? undefined : APP_SOCKET_PORT };
  });

  // 隐藏 electron 默认菜单
  Menu.setApplicationMenu(null);

  // 子窗体
  ipcMain.handle(
    "request:openSubWindow",
    async (
      _event: IpcMainInvokeEvent,
      msg: {
        type: string;
        property: WindowOptions;
      }
    ) => {
      const { type, property } = msg;
      WindoManagerInstance.createSubWindow(type, property);
    }
  );

  // Dialog文件选择框
  ipcMain.handle(
    "showDialog",
    (
      _event: IpcMainInvokeEvent,
      msg: {
        filterType: string;
        dialogType: string;
        data?: any;
      }
    ) => {
      const { filterType, dialogType, data } = msg;
      const finalFilter = [{ name: "All Files", extensions: ["*"] }];
      const selectFilterList = [
        {
          name: "verilog",
          extensions: ["v"],
        },
        {
          name: "lib",
          extensions: ["lib"],
        },
        {
          name: "sdc",
          extensions: ["sdc"],
        },
        {
          name: "lef",
          extensions: ["lef"],
        },
        {
          name: "def",
          extensions: ["def"],
        },
        {
          name: "spef/sdf",
          extensions: ["spef", "sdf"],
        },
        {
          name: "txt",
          extensions: ["txt"],
        },
        {
          name: "tcl",
          extensions: ["tcl"],
        },
      ];

      const target = selectFilterList.find((item) => item.name === filterType);
      if (target) {
        finalFilter.unshift(target);
      }

      const defaultFileNameMap: Record<string, string> = {
        verilog: "new_file.v",
        tcl: "export_tcl.tcl",
        txt: "Report.txt",
      };

      // 文件写入权限检查
      const checkWritePermission = (savePath: string) => {
        try {
          const filePath = fs.existsSync(savePath)
            ? savePath
            : path.dirname(savePath);
          fs.accessSync(filePath, fs.constants.W_OK);
          return { access: true };
        } catch (err: any) {
          return {
            access: false,
            msg:
              err?.message ||
              `Unknown error while checking write permission for: ${savePath}`,
          };
        }
      };

      // 判断是否为保存
      if (dialogType === "save") {
        const savePath = dialog.showSaveDialogSync({
          title: `Save As .${target?.extensions[0]} file`,
          defaultPath: defaultFileNameMap[filterType],
          filters: finalFilter,
        });

        if (!savePath) {
          return { status: "cancel", data: null };
        }
        const { access, msg } = checkWritePermission(savePath);
        if (!access) return { status: "failed", msg };

        return { status: "success", data: savePath };
      } else if (dialogType === "write") {
        const savePath = dialog.showSaveDialogSync({
          title: `Save As .${target?.extensions[0]} file`,
          defaultPath: defaultFileNameMap[filterType],
          filters: finalFilter,
        });

        if (!savePath) {
          return { status: "cancel", data: null };
        }
        const { access, msg } = checkWritePermission(savePath);
        if (!access) return { status: "failed", msg };

        if (data) {
          try {
            let content;
            if (Array.isArray(data)) content = data.join("\n");
            else content = JSON.stringify(data, null, 2);

            fs.writeFileSync(savePath, content, "utf-8");
            return { status: "success", data: savePath };
          } catch (e: any) {
            return { status: "failed", msg: e.message };
          }
        }
      } else {
        const result = dialog.showOpenDialogSync({
          title: "Choose files",
          properties: ["openFile", "multiSelections"],
          filters: finalFilter,
        });

        return { status: "success", data: result };
      }
    }
  );

  ipcMain.on("request:adjustHeight", (_event, changedHeight: number) => {
    const timingWin = WindoManagerInstance.getSubWindow("report_timing");
    if (timingWin) {
      const [width, height] = timingWin.getSize();
      timingWin.setSize(width, height + changedHeight);
    }
  });

  ipcMain.on("request:minimizeGui", (event) => {
    const curWindow = BrowserWindow.fromWebContents(event.sender);
    const allWindows = BrowserWindow.getAllWindows();
    allWindows.forEach((win, index) => {
      if (!win.isDestroyed() && win !== curWindow) {
        // 每个窗口延迟minimize，缓解密集操作
        setTimeout(() => {
          win.minimize();
        }, index * 10);
      }
    });

    if (curWindow && !curWindow.isDestroyed()) {
      setTimeout(() => {
        curWindow.close();
      }, 100);
    }
  });

  ipcMain.on("request:closeGui", (_event) => {
    const allWindows = BrowserWindow.getAllWindows();
    allWindows.forEach((win) => {
      if (!win.isDestroyed()) {
        win.close();
      }
    });
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
