/**
 * 打开 object chooser 窗口
 * @param chooseType report timing paths类型
 * @param ChannelName 通信名
 */
const openObjectChooser = async (
  chooseType: string,
  selectType: string,
  ChannelName: string
) => {
  await window.electronCommon.openSubWindow("object-chooser", {
    url: `/objectChooser?chooseType=${chooseType}&selectType=${selectType}&channelName=${ChannelName}`,
    title: "Object Chooser",
    width: 337,
    minWidth: 337,
    maxWidth: 337,
    height: 326,
    minHeight: 326,
    maxHeight: 326,
  });
};

export default openObjectChooser;
