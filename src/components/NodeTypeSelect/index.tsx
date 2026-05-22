import { Dropdown } from "antd";
import { useMemo } from "react";
import { DownOutlined } from "@ant-design/icons";
import styles from "./index.less";
import { INodeTypeSelectHookResult } from "./useNodeTypeSelect";

export const defaultNodeTypeMenu = [
  {
    label: "Nets",
    key: "net",
  },
  {
    label: "Pins",
    key: "pin",
  },
  {
    label: "Ports",
    key: "port",
  },
];

export const NodeTypeSelect = (props: INodeTypeSelectHookResult) => {
  const { menuItems, currentNodeType, setCurrentNodeType } = props;
  const finalMenuItems = useMemo(
    () =>
      menuItems.map((item: any) =>
        item
          ? {
              ...item,
              label: (
                <div onClick={() => setCurrentNodeType(item?.key)}>
                  {item?.label}
                </div>
              ),
            }
          : null
      ),
    [menuItems, setCurrentNodeType, currentNodeType]
  );

  const currentNodeLabel = useMemo(() => {
    const currentItem = menuItems.find(
      (item: any) => item?.key === currentNodeType
    );
    return currentItem ? <div>{currentItem.label}</div> : null;
  }, [menuItems, currentNodeType]);

  return (
    <Dropdown
      menu={{
        items: finalMenuItems,
      }}
      trigger={["click"]}
      overlayClassName={styles["dropdown"]}
    >
      <div className={styles["container"]}>
        <div className={styles["label"]}>{currentNodeLabel}</div>
        <div className={styles["icon"]}>
          <DownOutlined
            style={{
              width: "10px",
              height: "7px",
              color: "rgba(241,243,255,0.25)",
            }}
          />
        </div>
      </div>
    </Dropdown>
  );
};
