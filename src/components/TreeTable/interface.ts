import { ColumnsType } from "antd/es/table";
import { CSSProperties } from "react";
import { ContextMenuItem } from "../ContextMenu";

export type TreeTableColumns<D = IDataType> = ColumnsType<D>;

export interface ITreeTableProps<D extends IDataType = IDataType> {
  columns: TreeTableColumns<D>;
  dataSource: D[];
  /**
   * 选中的行数据的回调函数
   * @param data 当前行数据
   * @param index 当前行数据下标
   * @returns
   */
  handleSelect?: (data: D[]) => void;
  /**
   * 控制列的宽度
   */
  colWidths?: number[] | string[];

  /**
   * 根据内容自动计算宽度，和 colWidths 属性互斥且优先级更高
   */
  autoWidth?: boolean;

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

export interface IColumn {
  title: string;
  key: string;
}

export interface IDataType {
  /** key must be unique */
  key: string;
  title: string;
  rowKey: string;

  [key: string]: any;
}
