/**
 * 打开 error/warning/notice 窗口
 * @param type 窗口类型
 * @param content 窗口内容
 */

const typeTitleMap: Record<string, string> = {
  error: "Error",
  warning: "Warning",
  notice: "Notice",
};

const openTooltip = async (type: string, content: string) => {
  const channelName = `custom_channel_${Date.now()}`;
  const channel = new BroadcastChannel(channelName);
  const handler = (event: MessageEvent) => {
    if (event.data?.type === "ready") {
      channel.postMessage({ type, content });
      channel.removeEventListener("message", handler);
      channel.close();
    }
  };

  channel.addEventListener("message", handler);

  await window.electronCommon.openSubWindow(type, {
    url: `/tooltip?channelName=${channelName}`,
    title: typeTitleMap[type],
    width: 400,
    minWidth: 400,
    maxWidth: 400,
    height: 128,
    minHeight: 128,
    maxHeight: 128,
  });
};

export default openTooltip;
