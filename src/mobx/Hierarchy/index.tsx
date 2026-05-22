import { DataNode } from "antd/es/tree";
import { makeAutoObservable } from "mobx";
import {
  IBaseData,
  IFileHierarchy,
  IHierarchy,
  ISelectedHierarchy,
} from "./interface";

class Hierarchy implements IHierarchy {
  public baseHierarchy: IBaseData | null = null;

  public hierarchySelected: ISelectedHierarchy | null = null;
  public leafSelected: ISelectedHierarchy | null = null;
  public hierarchyIconNode: ISelectedHierarchy | null = null;

  // 用于 antd tree 的数据，属于 @computed 装饰器
  get hierarchyTree() {
    return this.createHierarchyTree(this.baseHierarchy?.hierarchy);
  }

  // 用于返回顶层的 hierarchy 信息
  get topHierarchy() {
    const item = Array.isArray(this.baseHierarchy?.hierarchy)
      ? this.baseHierarchy?.hierarchy[0]
      : null;

    return {
      handle_name: item?.type ?? "",
      name: item?.title ?? "",
    };
  }

  constructor() {
    makeAutoObservable(this);
  }

  public createHierarchyTree(list: IFileHierarchy[] | undefined): DataNode[] {
    if (!list || list.length === 0) return [];
    return list.map((item) => {
      const { title, type, children } = item;
      const curTitle = title || type;
      const newObj: DataNode = {
        title:
          type === this.hierarchyIconNode?.handle_name ? (
            <div>
              <span
                style={{
                  color: "#08FF41",
                  marginRight: "4px",
                  fontWeight: 500,
                }}
              >
                {">"}
              </span>
              {curTitle}
            </div>
          ) : (
            curTitle
          ),
        key: type,
        children: [],
      };
      if (children && children.length > 0) {
        newObj["children"] = this.createHierarchyTree(children);
      }
      return newObj;
    });
  }

  static create() {
    const instance = new Hierarchy();

    window.sharedWorker.port.addEventListener(
      "message",
      (e: MessagePortEventMap["message"]) => {
        const content = e.data.content;

        if (content?.type === "hierarchy") {
          // 数据适配区
          instance.updateBaseData({
            hierarchy: content.data,
          });
        }
      }
    );

    return instance;
  }

  public updateBaseData(data: IBaseData) {
    this.baseHierarchy = { ...this.baseHierarchy, ...data };
  }

  public save() {
    return JSON.stringify(this.baseHierarchy);
  }

  public restore(data: string) {
    return JSON.parse(data);
  }

  public updateLeafSelected(newLeafSelected: ISelectedHierarchy | null) {
    this.leafSelected = newLeafSelected;
  }

  public updateHierarchySelected(
    newHierarchySelected: ISelectedHierarchy | null
  ) {
    this.hierarchySelected = newHierarchySelected;
    this.leafSelected = null;
  }

  public updateHierarchySelectedIcon(selectedNode: ISelectedHierarchy | null) {
    this.hierarchyIconNode = selectedNode;
    this.updateHierarchySelected(selectedNode);
  }
}

export default Hierarchy.create();
