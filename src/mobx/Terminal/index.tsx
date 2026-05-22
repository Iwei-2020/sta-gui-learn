import { autorun, makeAutoObservable } from "mobx";
import React, { ReactNode } from "react";
import { ILog, ITerminal } from "./interface";
import { titleMenuStore } from "../TitleMenuStore";

class Terminal implements ITerminal {
  public buffer: Array<ILog> = [];
  public bufferFormate: Array<ReactNode> = [];
  public cmdList: Array<string> = [];
  public orderHistory: Array<string> = [];
  static instance: ITerminal | null = null;
  /**
   * 高亮keyword，需要与Eda协商，先自定义两组关键字和颜色的映射，后续修改
   */
  private hlDict = new Map<string, string>([
    ["error", "#FF0000"],
    ["warn", "#ceb50e"],
  ]);

  /**
   * 用于实现对log进行处理和文本内容高亮
   * @param log log内容
   * @param key 可选参数，用于restore时节点不产生重复key
   * @returns 解析后的log内容
   */
  private logResolve(log: ILog, key?: number): React.ReactNode {
    switch (log.type) {
      case "request":
        this.addOrderHistory(log.content);
        return (
          <div key={`d_req_${key ?? this.bufferFormate.length}`}>
            {`STA_shell> `}
            <span id="req_content" style={{ color: "#32C47D" }}>
              {log.content}
            </span>
          </div>
        );
      case "response":
        return (
          <div key={`d_res_${key ?? this.bufferFormate.length}`}>
            <span
              key={`s_res_${key ?? this.bufferFormate.length}`}
              dangerouslySetInnerHTML={{
                __html: log.content,
              }}
            />
          </div>
        );
      default:
        return;
    }
  }

  constructor() {
    makeAutoObservable(this);
    autorun(() => {
      const commands = this.orderHistory;
      let hasReadLib = false;
      let hasNetlist = false;
      let hasSdc = false;

      for (const cmd of commands) {
        if (!hasReadLib && cmd.startsWith("read_liberty")) hasReadLib = true;
        if (!hasNetlist && cmd.startsWith("read_verilog")) hasNetlist = true;
        if (!hasSdc && cmd.startsWith("read_sdc")) hasSdc = true;
        if (hasReadLib && hasNetlist && hasSdc) break;
      }

      if (hasReadLib) {
        titleMenuStore.setDisabled(["netlist"], false);
      }

      if (hasReadLib && hasNetlist) {
        titleMenuStore.setDisabled(
          ["sdc", "def", "spef_sdf", "top_schematic"],
          false
        );
      }

      if (hasReadLib && hasNetlist && hasSdc) {
        titleMenuStore.setDisabled(["report_timing"], false);
      }
    });
  }

  public addOrderHistory(order: string) {
    this.orderHistory = [...this.orderHistory, order];
  }

  public save() {
    return JSON.stringify(this.buffer);
  }

  public restore(data: string) {
    this.buffer = JSON.parse(data);
    this.bufferFormate = this.buffer.map((item, index) =>
      this.logResolve(item as any, index)
    );
  }

  public insert(logs: Array<ILog>) {
    this.buffer.push(...logs);
    this.bufferFormate.push(...logs.map((log) => this.logResolve(log)));
  }

  public clear() {
    this.buffer.length = 0;
    this.bufferFormate.length = 0;
  }

  public updateCmdList(cmdList: string[]) {
    this.cmdList = cmdList;
  }

  public clearCmdList() {
    this.cmdList = [];
  }

  public send(content: string) {
    window.electronAPI.request({
      type: "terminal:executeCmd",
      cmd: content,
      receiveNow: true,
    });
  }

  public startMonitor() {
    window.electronAPI.request({
      type: "terminalInit",
      cmd: "",
      receiveNow: true,
    });
  }

  static create() {
    if (!this.instance) {
      this.instance = new Terminal();
    }

    // 监听Terminal数据流
    window.sharedWorker.port.addEventListener(
      "message",
      (e: MessagePortEventMap["message"]) => {
        const content = e.data.content;
        // console.log(content?.type, content?.logs);
        if (content?.type === "terminal" && this.instance) {
          void (content?.logs && this.instance.insert(content.logs));
        }
        if (content?.type === "cmdCompleted") {
          const logs = content.logs?.trim();
          if (logs?.startsWith("synth")) {
            window.electronAPI.request({
              type: "hierarchy",
            });
          }
        }
      }
    );

    return this.instance;
  }
}

export const terminalModel = Terminal.create();
