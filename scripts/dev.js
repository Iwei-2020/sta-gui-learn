const { getAvailablePort } = require("./libs/port");
const concurrently = require("concurrently");
const path = require("path");

getAvailablePort().then((port) => {
  const webserverPort = port ?? 10000;

  const args = process.argv;
  const portIndex = args.indexOf("-p");
  const websocketPort =
    portIndex !== -1 && portIndex + 1 < args.length
      ? args[portIndex + 1]
      : 9999;

  concurrently(
    [
      `tsc -p ./app/tsconfig.json --watch`,
      `cross-env NODE_ENV=development ERROR_OVERLAY=none PORT=${webserverPort} UMI_APP_WEBSOCKET_PORT=${websocketPort} max dev`,
      `sleep 8 && ulimit -c 0 && xauth merge ~/.Xauthority &&  electron . --development --no-sandbox --webserver-port=${webserverPort}`,
    ],
    {
      cwd: path.resolve(__dirname, "../"),
    }
  );
});
