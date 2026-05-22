// 运行时配置
import "./app.css";
import "./app.d";
import { UUID } from "./utils/uuid";

window.sharedWorker = new SharedWorker("/sharedworker.js");
window.sharedWorker.port.start();

// 用于sharedworker指定port消息转发,每次创建一个窗口，都会重新生成一个portId
const PORT_ID = `port-${UUID()}`;

let port = Number(process.env.UMI_APP_WEBSOCKET_PORT);
window.myAPI.getPorts().then((args: any) => {
  if (args.port) {
    port = Number(args.port);
  }

  window.sharedWorker.port.postMessage({
    type: "init",
    portId: PORT_ID,
    port: port,
  });
});

window.electronAPI = {
  request: async (param) => {
    param.isBroadcast = !!param.isBroadcast;
    param.responseNow = !!param.responseNow;

    return new Promise((resolve, reject) => {
      const requestId = UUID();
      window.sharedWorker.port.postMessage({
        ...param,
        requestId,
        portId: PORT_ID,
      });

      if (param.reponseNow) {
        resolve({
          code: 0,
          msg: "success",
          data: null,
        });
        return;
      }

      const listener = (e: MessagePortEventMap["message"]) => {
        const data = e.data;
        const content = data.content;
        if (data.msgType === "data") {
          if (content.requestId === requestId) {
            window.sharedWorker.port.removeEventListener("message", listener);

            if (content.code === 0) {
              resolve(content);
            } else {
              reject(content);
            }
          }
        }
      };

      window.sharedWorker.port.addEventListener("message", listener);
    });
  },
};
