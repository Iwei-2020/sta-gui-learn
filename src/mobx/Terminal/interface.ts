import { ReactNode } from 'react';
import { IBusiness } from '../interface';

export interface ILog {
  /** Log类型 */
  type: 'request' | 'response';

  /** Log文本内容 */
  content: string;
}

export interface IHilightItem {
  /** 高亮关键字 */
  keyword: string;
  /** 关键字对应的高亮颜色 */
  color: string;
}

export interface ITerminal extends IBusiness {
  /** Logs缓冲区 */
  buffer: Array<ILog>;

  /** 高亮文本的buffer */
  bufferFormate: Array<ReactNode>;

  updateCmdList: (cmdList: string[]) => void;

  orderHistory: Array<string>;

  addOrderHistory: (order: string) => void;

  clearCmdList: () => void;

  cmdList: Array<string>;

  /**
   * 往buffer中新增log,同时在bufferFormate中新增高亮文本
   * @param log Log信息
   * @returns
   */
  insert: (logs: Array<ILog>) => void;

  /**
   * 清空Log信息
   * @returns
   */
  clear: () => void;

  /**
   * 保存buffer信息，用于还原bufferFormate
   * @returns 序列化buffer
   */
  save: () => string;

  /**
   * 将序列化buffer反序列化，并解析成bufferFormate
   * @param data
   * @returns
   */
  restore: (data: string) => void;

  /**
   * 发送消息
   * @param content 消息
   * @returns
   */
  send: (content: string) => void;

  /**
   * 开始监听
   * @returns 
   */
  startMonitor:() => void;
}
