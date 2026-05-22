import { flexLayoutManager } from "@/mobx";
import {
  Action,
  Actions,
  ITabRenderValues,
  Layout,
  Model,
  TabNode,
} from "flexlayout-react";
import "flexlayout-react/style/dark.css";
import { observer } from "mobx-react";
import { useRef } from "react";
import "./index.less";
import { Tooltip } from "antd";

export const FlexLayoutWrapper = observer(({ model }: { model: Model }) => {
  const layoutRef = useRef<Layout>(null);

  const onAction = (action: Action) => {
    // 处理tab关闭操作
    if (action.type === "FlexLayout_DeleteTab") {
      const tabNode = model.getNodeById(action.data.node);
      const tabId = tabNode?.getId() as string;
      flexLayoutManager.deleteTab(tabId);
    }
    if (action.type === Actions.CLOSE_WINDOW) {
      model.visitWindowNodes(action.data.windowId, (node) => {
        model.doAction(Actions.deleteTab(node.getId()));
        flexLayoutManager.returnOriginalTab(node.getId());
      });
    }
    return action;
  };

  return (
    <div className="flexlayout_wrapper">
      <Layout
        ref={layoutRef}
        model={model}
        supportsPopout={true}
        factory={flexLayoutManager.componentFactory}
        onRenderTab={(node: TabNode, renderValues: ITabRenderValues) => {
          if (node.getConfig() && node.getConfig().icon)
            renderValues.leading = node.getConfig().icon;

          const fullName = node.getName();
          const shortName =
            fullName.length < 12
              ? fullName
              : `${fullName.substring(0, 10)}...${fullName.slice(-1)}`;

          renderValues.content = (
            <Tooltip title={fullName} placement="bottom">
              <span>{shortName}</span>
            </Tooltip>
          );
        }}
        onAction={onAction}
      />
    </div>
  );
});
