import { contextBridge, ipcRenderer } from "electron";
import { WindowOptions } from "./utils/windowManager";

export interface IElectronAPI {
  getPorts: () => Promise<{ port?: string }>;
}
export interface IElectronCommon {
  /**
   * Render层请求打开子窗体
   * @returns
   */
  openSubWindow: (type: string, property?: WindowOptions) => Promise<void>;

  /**
   * Render层请求打开Dialog
   * @returns
   */
  showDialog: (
    dialogType: string,
    filterType?: string,
    data?: any
  ) => Promise<{ status: string; msg?: string; data?: any }>;

  /**
   * Render层请求调整子窗体高度
   */
  adjustTimingWindowHeight: (step: number) => void;

  /**
   * 最小化GUI界面
   */
  minimizeGui: () => Promise<void>;

  /**
   * 关闭全部GUI界面
   */
  closeGui: () => Promise<void>;
}

contextBridge.exposeInMainWorld("myAPI", <IElectronAPI>{
  getPorts: async () => await ipcRenderer.invoke("socket-port"),
});

contextBridge.exposeInMainWorld("electronCommon", <IElectronCommon>{
  openSubWindow: (type: string, property?: WindowOptions) =>
    ipcRenderer.invoke("request:openSubWindow", { type, property }),
  showDialog: (dialogType: string, filterType?: string, data?: any) => {
    return ipcRenderer.invoke("showDialog", { filterType, dialogType, data });
  },
  adjustTimingWindowHeight: (step: number) =>
    ipcRenderer.send("request:adjustHeight", step),
  minimizeGui: () => {
    ipcRenderer.send("request:minimizeGui");
  },
  closeGui: () => {
    ipcRenderer.send("request:closeGui");
  },
});
