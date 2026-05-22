import { DataNode } from "antd/es/tree";
import { IBusiness } from "../interface";

export interface IBaseData {
  hierarchy: IFileHierarchy[];
}

export interface ISelectedHierarchy {
  handle_name: string;
  name: string;
}

export interface IFileHierarchy {
  /** 当前层级的 title 名称 */
  title: string;
  /** 当前层级的类型 */
  type: string;
  /** 子层级信息 */
  children: IFileHierarchy[];
}

export interface IHierarchy extends IBusiness {
  /** 层级数据 */
  baseHierarchy: IBaseData | null;

  /** 当前高亮层级 info */
  hierarchySelected: ISelectedHierarchy | null;

  /** 当前选中 leaf browser层级 info */
  leafSelected: ISelectedHierarchy | null;

  /** 当前选中层级 info */
  hierarchyIconNode: ISelectedHierarchy | null;

  /**
   * 基于基础 hierarchy 数据生成 antd tree 组件可识别的数据
   * @param list 原始 hierarchy 数据
   * @param parentKey 层级信息 key
   * @returns
   */
  createHierarchyTree: (
    list: IFileHierarchy[],
    parentKey: string
  ) => DataNode[];

  /**
   * 更新层级数据
   * @param data
   * @returns
   */
  updateBaseData: (data: IBaseData) => void;

  /**
   * 更新当前高亮层级 id
   * @param newHierarchySelected 当前层级信息
   * @returns
   */
  updateHierarchySelected: (
    newHierarchySelected: ISelectedHierarchy | null
  ) => void;

  /**
   * 更新 leafBrowser 选中的信息
   * @param newLeafSelected 当前 leafBrowser 的信息
   * @returns
   */
  updateLeafSelected: (newLeafSelected: ISelectedHierarchy | null) => void;

  /**
   * 更新hierarchy选中节点
   * @param selectedNode 点击选中的节点信息
   * @returns
   */
  updateHierarchySelectedIcon: (
    selectedNode: ISelectedHierarchy | null
  ) => void;
}
