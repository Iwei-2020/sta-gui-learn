let ports = {};
let ws = null;
let queue = [];

const broadMsg = (data) => {
  Object.values(ports).forEach((p) => p.postMessage(data));
};

self.onconnect = function (e) {
  const port = e.ports[0];

  port.onmessage = (event) => {
    if (event.data.requestId) {
      if (ws && ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(event.data));
      } else {
        // 避免消息丢失
        queue.push(event.data);
      }
    } else {
      switch (event.data.type) {
        case "init":
          ports[event.data.portId] = port;
          if (ws) return;
          // 创建 WebSocket 连接
          ws = new WebSocket(`ws://localhost:${event.data.port}`);

          ws.onopen = () => {
            while (queue.length) ws.send(JSON.stringify(queue.shift()));
            broadMsg({ msgType: "signal", content: "onopen" });
          };

          ws.onmessage = (event) => {
            const content = JSON.parse(event.data);
            if (content.isBroadcast) {
              broadMsg({ msgType: "data", content });
            } else {
              if (content.portId) {
                ports[content.portId].postMessage({
                  msgType: "data",
                  content,
                });
              } else {
                broadMsg({
                  msgType: "data",
                  content,
                });
              }
            }
          };

          ws.onclose = () => {
            port.close();
            ws.close();
            // todo: 重连逻辑（指数退避）
          };

          ws.onerror = (error) => {
            broadMsg({ msgType: "error", content: error });
          };
          break;
      }
    }
  };

  port.start();
};
