import Tab from "@/pages/components/FlexLayoutWrapper/tab";
import { UUID } from "@/utils/uuid";
import {
  Actions,
  DockLocation,
  IJsonModel,
  ITabAttributes,
  Model,
  Node,
  TabNode,
} from "flexlayout-react";
import { ObservableSet, action, makeObservable, observable } from "mobx";

const layoutJson: IJsonModel = {
  global: {
    tabEnableClose: true,
    borderEnableDrop: false,
    tabSetEnableDrag: false,
    splitterSize: 4,
    tabEnablePopout: true,
    tabSetMinWidth: 200,
    tabEnableRenderOnDemand: true,
  },
  layout: {
    type: "row",
    children: [
      {
        type: "tabset",
        enableDivide: false,
        enableDeleteWhenEmpty: false,
        id: "#mainArea",
        children: [],
      },
      {
        type: "tabset",
        enableDivide: false,
        enableDeleteWhenEmpty: false,
        id: "#rightArea",
        children: [],
      },
    ],
  },
};

class FlexLayout {
  public model: Model | undefined;
  // 为了监听删除tab的操作
  public validTabIds: ObservableSet<string>;
  public mainArea: Node | undefined;
  public rightArea: Node | undefined;
  private static instance: FlexLayout | null = null;

  public componentFactory = (node: TabNode) => {
    switch (node.getComponent()) {
      case "init":
        return <div>init</div>;
      case "common":
        if (node.getConfig()) {
          return <Tab node={node}></Tab>;
        }
    }
  };

  /**
   * 新增tab
   * @param winName 窗口名
   * @param component 内部主体组件
   * @param tabsetID 添加tabset的id，若不传，则默认add到mainArea
   * @param tabId 要切换到的 tab 的 id
   * @param icon 窗体图标，不传则没有
   * @param gaiaId schematic viewer的唯一标识，添加schematic的时候需要传入
   */
  public addNewTab = (
    winName: string,
    component: JSX.Element,
    tabsetID?: string,
    tabId?: string,
    icon?: JSX.Element
  ) => {
    const tabConfig: ITabAttributes = {
      type: "tab",
      name: winName,
      id: tabId,
      component: "common",
      config: { icon: icon, content: component },
    };

    this.model?.doAction(
      Actions.addNode(
        tabConfig,
        tabsetID ?? "#mainArea",
        DockLocation.CENTER,
        -1
      )
    );

    this.validTabIds.add(tabId!);
  };

  /**
   * 通过最大最小化处理页面布局
   * @param tabsetId 最大化最小化切换的tabset
   */

  public maximizeTab(tabsetId: string) {
    this.model?.doAction(Actions.maximizeToggle(tabsetId));
  }
  /**
   * 获取指定id的tab
   * @param tabId
   * @returns
   */
  public getTab(tabId: string) {
    return this.model?.getNodeById(tabId);
  }

  public isTabValid(tabId: string): boolean {
    return this.validTabIds.has(tabId);
  }

  /**
   * 删除指定id的tab
   * @param tabId
   */
  public deleteTab(tabId: string) {
    this.validTabIds.delete(tabId);
    const targetTab = this.model?.getNodeById(tabId);
    if (targetTab) {
      // 删除该 tab
      this.model?.doAction(Actions.deleteTab(tabId));
    } else {
      console.warn(`Tab with id ${tabId} not found`);
    }
  }

  /**
   * 切换到指定的 tab
   * @param tabId 要切换到的 tab 的 id
   */
  public switchToTab = (tabId: string) => {
    const targetTab = this.model?.getNodeById(tabId);
    if (targetTab) {
      // 激活该 tab
      this.model?.doAction(Actions.selectTab(tabId));
    } else {
      console.warn(`Tab with id ${tabId} not found`);
    }
  };

  public addPopoutWin = (
    winName: string,
    component: JSX.Element,
    icon?: JSX.Element
  ) => {
    const tabId = UUID();
    const tabConfig: ITabAttributes = {
      type: "tab",
      id: tabId,
      name: winName,
      component: "common",
      config: { content: component, icon: icon },
    };
    this.model?.doAction(
      Actions.addNode(tabConfig, "#mainArea", DockLocation.CENTER, -1)
    );
    this.model?.doAction(Actions.popoutTab(tabId));
  };

  public returnOriginalTab = (curId: string, oriID?: string) => {
    this.model?.doAction(
      Actions.moveNode(curId, oriID || "#mainArea", DockLocation.CENTER, -1)
    );
  };

  constructor() {
    this.validTabIds = new ObservableSet<string>();
    makeObservable(this, {
      model: observable,
      validTabIds: observable,
      addNewTab: action,
      switchToTab: action,
      getTab: action,
      deleteTab: action,
    });
  }

  static create() {
    if (!this.instance) {
      this.instance = new FlexLayout();
      this.instance.model = Model.fromJson(layoutJson);
      this.instance.mainArea = this.instance.model.getNodeById("#mainArea");
      this.instance.rightArea = this.instance.model.getNodeById("#rightArea");
    }

    return this.instance;
  }
}

export default FlexLayout.create();
