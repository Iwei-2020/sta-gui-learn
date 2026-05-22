import { Input } from "antd";
import styles from "./index.less";
import consoleIcon from "@/assets/Icon/console.png";
import { useCallback, useEffect, useRef, useState } from "react";
import { terminalModel } from "@/mobx/Terminal";
import { observer } from "mobx-react";
import { toJS } from "mobx";
const TerminalPanel = observer(() => {
  const [content, setContent] = useState<string>("");
  /** cmd历史记录 */
  const [ordersHistory, setOrdersHistory] = useState<Array<string>>([]);
  /** 记录当前索引指令下标 */
  const [curIndex, setCurIndex] = useState<number>();
  const logsRef = useRef<HTMLDivElement>(null);
  const [isShowCmdHelper, setIsShowCmdHelper] = useState<boolean>(false);

  /** 指针用于记录当前用方位键调出的指令所在orderHistory中的位置 */
  let orderPointer = useRef<number>(ordersHistory.length);

  /** Terminal置底 */
  const scrollToBottom = useCallback(() => {
    logsRef.current!.scrollTop =
      logsRef.current!.scrollHeight - logsRef.current!.clientHeight;
  }, [terminalModel.buffer.length]);

  /**
   * 索引cmd历史记录，添加索引高亮，并滚动到索引位置
   * @param isLast 可选。默认情况下索引上一条cmd;当isLast=false情况下，索引下一条cmd
   * @returns
   */
  const indexLastCmd = (isLast: boolean = true) => {
    const requests = document.querySelectorAll("#req_content");
    if (requests.length === 0) return;
    let _curIndex;
    /** 首次索引，curIndex未记录 */
    if (curIndex === undefined) {
      _curIndex = isLast ? requests.length - 1 : 0;
    } else {
      /** 将上次的索引高亮取消 */
      const lastIndex = curIndex;
      const lastTargetElement = requests[lastIndex] as HTMLElement;
      lastTargetElement.style.backgroundColor = "";
      /** 高亮本次的索引，并滚动到当前索引位置 */
      if (isLast === false) {
        _curIndex = (curIndex + 1) % requests.length;
      } else {
        _curIndex = (curIndex - 1 + requests.length) % requests.length;
      }
    }
    const targetElement = requests[_curIndex] as HTMLElement;
    logsRef.current!.scrollTop =
      targetElement.offsetTop -
      logsRef.current!.offsetTop -
      logsRef.current!.clientHeight / 2;
    targetElement.style.backgroundColor = "#121212";
    setCurIndex(_curIndex);
  };

  const handleSend = async () => {
    if (content.trim().toLowerCase() === "clear") {
      terminalModel.clear();
      setContent("");
      return;
    }
    if (content.length) {
      setOrdersHistory((a) => {
        return [...a, content];
      });
    }
    setContent("");
    scrollToBottom();
    terminalModel.send(content);
  };

  const cmdCompletion = async (cmd: string, position: number) => {
    const res = await window.electronAPI.request({
      type: "terminal:cmdCompletion",
      receiveNow: true,
      cmd: cmd,
      position: position,
    });
    terminalModel.updateCmdList(res.data);
  };

  /**
   * 调取cmd历史记录
   * @param e 监听键盘事件，根据键盘的输入控制Terminal input内容，通过方向键调用之前的命令
   * @returns
   */
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    switch (e.key) {
      /** 回车:发送 */
      case "Enter":
        if (!isShowCmdHelper) {
          handleSend();
          orderPointer.current = ordersHistory.length + 1;
        }
        return;
      /** 方向键↑:上一条cmd指令 */
      case "ArrowUp": {
        e.preventDefault();
        if (!isShowCmdHelper) {
          const nextOrderPointer =
            orderPointer.current > 0
              ? orderPointer.current - 1
              : orderPointer.current;
          setContent(ordersHistory[nextOrderPointer] ?? "");
          orderPointer.current = nextOrderPointer;
        }
        return;
      }
      /** 方向键↓: 下一条cmd指令 */
      case "ArrowDown": {
        e.preventDefault();
        if (!isShowCmdHelper) {
          const nextOrderPointer =
            orderPointer.current < ordersHistory.length
              ? orderPointer.current + 1
              : orderPointer.current;
          setContent(ordersHistory[nextOrderPointer] ?? "");
          orderPointer.current = nextOrderPointer;
        }
        return;
      }
      /** ESC:清空输入框内容 */
      case "Escape":
        if (!isShowCmdHelper) setContent("");
        setIsShowCmdHelper(false);
        return;
      /** Page Up:向上翻页*/
      case "PageUp":
        if (!isShowCmdHelper) {
          if (logsRef.current) {
            logsRef.current.scrollTop -= logsRef.current.clientHeight;
          }
        }
        return;
      /** Page Down:向下翻页*/
      case "PageDown":
        if (!isShowCmdHelper) {
          if (logsRef.current) {
            logsRef.current.scrollTop += logsRef.current.clientHeight;
          }
        }
        return;
      /** home:如果光标不在首位，先将光标移到首位；如果已经在首位，则将Terminal滚动到顶部*/
      case "Home": {
        if (!isShowCmdHelper) {
          const inputElement = e.target as HTMLInputElement;
          if (inputElement.selectionStart === 0) {
            e.preventDefault();
            if (logsRef.current) {
              logsRef.current.scrollTop = 0;
            }
          }
        }
        return;
      }
      /** end:如果光标不在末尾，则先将光标移到末尾；如果已经在末尾，则将Terminal滚动到底部 */
      case "End": {
        if (!isShowCmdHelper) {
          const inputElement = e.target as HTMLInputElement;
          if (inputElement.selectionStart === inputElement.value.length) {
            e.preventDefault();
            if (logsRef.current) {
              scrollToBottom();
            }
          }
        }
        return;
      }
      /** F3：索引到上一条命令*/
      case "F3":
        e.preventDefault();
        if (!isShowCmdHelper) {
          if (e.shiftKey) {
            indexLastCmd(false);
          } else {
            indexLastCmd();
          }
        }
        return;
      case "Tab": {
        e.preventDefault();
        const terminalInput = document.querySelector(
          "#terminal_input"
        ) as HTMLInputElement;
        const cursorPosition = terminalInput.selectionStart as number;
        cmdCompletion(content, cursorPosition);
        setIsShowCmdHelper((item) => !item);
        return;
      }
      case "Backspace":
        setIsShowCmdHelper(false);
        terminalModel.clearCmdList();
      default:
        return;
    }
  };

  useEffect(() => {
    terminalModel.startMonitor();
    setContent(terminalModel.cmdList[0] ?? "");
    if (terminalModel.cmdList.length > 0) {
      setIsShowCmdHelper(true);
    }
  }, [terminalModel.cmdList]);

  useEffect(() => {
    (document.querySelector("#terminal_input") as HTMLElement)?.focus();
    scrollToBottom();
  }, [isShowCmdHelper, terminalModel.buffer.length]);

  return (
    <div className={styles["terminal-panel"]}>
      <div className={styles["terminal-title"]}>
        <img src={consoleIcon} className={styles["console-icon"]} />
        <div className={styles["title-name"]}>Console</div>
      </div>
      <div className={styles["terminal-logs"]} ref={logsRef}>
        {toJS(terminalModel.bufferFormate).map((log, index) => (
          <div key={index}>{log}</div>
        ))}
      </div>

      <Input
        placeholder="Enter Console Command"
        className={styles["terminal-input"]}
        id="terminal_input"
        value={content}
        onChange={(e) => {
          const v = e.target.value;
          setContent(v);
        }}
        onKeyDown={handleKeyDown}
      />
    </div>
  );
});

export default TerminalPanel;
