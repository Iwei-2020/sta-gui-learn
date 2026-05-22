import { ColumnsType } from "antd/es/table";
import { CSSProperties } from "react";
import { ContextMenuItem } from "../ContextMenu";

export interface ITableType {
  /** key must be unique */
  key: string;
  title: string;
  rowKey: string;
  [key: string]: string;
}
export type GenerateReportColumns<D = ITableType> = ColumnsType<D>;
export interface IGenerateReportProps<D extends ITableType = ITableType> {
  columns: GenerateReportColumns<D>;
  dataSource: D[];

  /**
   * 行数据的右击事件
   */
  contextEvent?: {
    menu?:
      | ContextMenuItem[]
      | ((record: D, event: React.MouseEvent) => ContextMenuItem[]);
    onMenuItemClick?: (
      record: D,
      evnet: React.MouseEvent
    ) => (item: ContextMenuItem) => void;
  };

  /**
   * 容器样式
   */
  style?: CSSProperties;
}
