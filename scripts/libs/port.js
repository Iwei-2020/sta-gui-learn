const net = require("net");

/**
 * 检查端口是否可用
 * @param {number} port 端口号
 * @returns {Promise<boolean>} 表示端口是否可用
 */
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();

    server.once("error", (err) => {
      if (err.code === "EADDRINUSE" || err.code === "EACCES") {
        resolve(false); // 端口被占用
      } else {
        resolve(false); // 其他错误
      }
    });

    server.once("listening", () => {
      server.close();
      resolve(true); // 端口可用
    });

    server.listen(port);
  });
}

/**
 * 获取某个范围内的第一个可用端口
 * @param {number} startPort 起始端口号
 * @param {number} endPort 结束端口号
 * @returns {Promise<number | null>} 第一个可用端口或null如果没有可用端口
 */
async function getAvailablePort(startPort = 8000, endPort = 9000) {
  for (let port = startPort; port <= endPort; port++) {
    const available = await isPortAvailable(port);
    if (available) {
      return port;
    }
  }
  return null;
}

module.exports = { getAvailablePort };
