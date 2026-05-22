import {
  IElectronAPI,
  IElectronCommon,
  IElectronMessage,
} from "@/../app/master/preload";

type IRequestParameter = {
  /** 请求类型 */
  type: string;

  /** 是否需要立即获取数据 */
  receiveNow?: boolean;

  /** 收到的请求是否需要广播其他窗口 */
  isBroadcast?: boolean;

  /** 其他参数 */
  [key: string]: any;
};

declare global {
  interface Window {
    electronAPI: {
      request: (param: IRequestParameter) => Promise<{
        /** 返回的code值，0为成功，400为失败 */
        code: number;

        /** 返回的message信息，成功为success，失败为其他信息 */
        msg: string;

        /** 返回封装好的data */
        data: any;
      }>;
    };

    sharedWorker: SharedWorker;
    electronMessage: IElectronMessage;
    electronCommon: IElectronCommon;
    myAPI: IElectronAPI;
  }
}
