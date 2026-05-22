import {
  BrowserWindow,
  BrowserWindowConstructorOptions,
  globalShortcut,
} from "electron";
import path from "path";
import { APP_ENV, windowMenuData } from "../common/constants";

export interface WindowOptions extends BrowserWindowConstructorOptions {
  url?: string;
}

class WindowManager {
  public mainWindow: BrowserWindow | null = null;
  public subWindows: Record<string, BrowserWindow> = {};

  /**
   * 创建主窗体
   * @param windowProperty
   * @returns
   */
  public async createMainWindow(windowProperty: WindowOptions) {
    if (!this.mainWindow) {
      this.mainWindow = await this.createWindow(windowProperty, "main");
    } else {
      throw new Error("主窗体不能重复创建");
    }

    return this.mainWindow;
  }

  /**
   * 创建子窗体
   * @param type
   * @param property
   * @returns
   */
  public async createSubWindow(type: string, property?: WindowOptions) {
    // 如果子窗体已经存在并且未销毁，则直接返回
    const existingWin = this.subWindows[type];
    if (existingWin && !existingWin.isDestroyed()) {
      existingWin.focus();
      return existingWin;
    }

    const result = windowMenuData.find((item) => item.id === type);
    let windowProperty = result ? result.property : property;
    // todo 需要添加property缺失提示
    if (!windowProperty) return;
    const curWin = await this.createWindow(windowProperty, type);
    // 关闭时删除映射
    curWin.on("closed", () => {
      delete this.subWindows[type];
    });

    // 保存到映射表
    this.subWindows[type] = curWin;
    return curWin;
  }

  /**
   * 创建窗体
   * @param property: 窗体属性
   * @param type: 窗体类型
   * @returns
   */

  public async createWindow(property: WindowOptions, type = "") {
    const mainWinPosition = this.mainWindow?.getPosition();
    // 相对于主窗体的偏移量
    const translateX = mainWinPosition ? mainWinPosition[0] + 100 : 0;
    const translateY = mainWinPosition ? mainWinPosition[1] + 100 : 0;

    const finalProperty: WindowOptions = {
      ...property,
      x: translateX,
      y: translateY,
      show: true,
      webPreferences: {
        preload: path.join(__dirname, "../preload.js"),
        devTools: APP_ENV === "development",
        nodeIntegration: true,
        contextIsolation: true,
        sandbox: false,
      },
    };

    if (finalProperty.url && !finalProperty.url?.startsWith("http")) {
      finalProperty.url =
        `http://localhost:${process.env.APP_WEBSERVER_PORT}` +
        finalProperty.url;
    }

    const newWin = new BrowserWindow(finalProperty);

    if (finalProperty.url) {
      newWin.loadURL(finalProperty?.url);
    }

    if (finalProperty.webPreferences?.devTools) {
      newWin.webContents.openDevTools({ mode: "detach" });
    }

    // 窗体监听
    if (type === "main") {
      newWin.webContents.addListener("destroyed", () => {});
    }

    newWin.webContents.addListener("destroyed", () => {
      newWin.close();
    });

    // 打开 DevTools 的快捷键 todo待测试
    globalShortcut.register("CommandOrControl+I", () => {
      const focusedWindow = BrowserWindow.getFocusedWindow();
      focusedWindow?.webContents.openDevTools({ mode: "detach" });
    });
    globalShortcut.register("CommandOrControl+Alt+I", () => {
      const focusedWindow = BrowserWindow.getFocusedWindow();
      focusedWindow?.webContents.openDevTools({ mode: "right" });
    });

    return newWin;
  }

  public getSubWindow(id: string): BrowserWindow | null {
    const win = this.subWindows[id];
    if (win && !win.isDestroyed()) return win;
    return null;
  }
}

export const WindoManagerInstance = new WindowManager();
