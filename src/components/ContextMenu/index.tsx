import { useState } from "react";
import ReactDOM from "react-dom/client";
import styles from "./index.less";

export interface ContextMenuItem {
  title: string;
  key: string;
  icon?: React.ReactNode;
  isHide?: boolean;
}

interface IProps {
  position: { x: number; y: number };
  onMenuItemClick: (item: ContextMenuItem) => void;
  menu: ContextMenuItem[];
}

export const CustomContextMenu = (props: IProps) => {
  const { position, onMenuItemClick, menu } = props;
  const [visible, setVisible] = useState(true);

  const handleMenuItemClick = (item: { title: string; key: string }) => {
    onMenuItemClick(item);
    setVisible(false);
  };

  if (visible) {
    return (
      <div
        className={styles["container"]}
        style={{ top: position.y, left: position.x }}
      >
        {menu.map(
          (item) =>
            !item.isHide && (
              <div
                className={styles["item"]}
                onClick={() => handleMenuItemClick(item)}
                key={item.key}
              >
                {item.icon && (
                  <span style={{ marginRight: "8px" }}>{item.icon}</span>
                )}
                <span>{item.title}</span>
              </div>
            )
        )}
      </div>
    );
  } else {
    return null;
  }
};

export const showContextMenu = (props: IProps) => {
  const { position, onMenuItemClick, menu } = props;

  const contextMenu = document.createElement("div");
  document.body.appendChild(contextMenu);

  const handleOutsideClick = (e: any) => {
    if (!contextMenu.contains(e.target)) {
      document.body.removeChild(contextMenu);
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("click", handleOutsideClick);
    }
  };

  const handleMenuItemClick = (item: ContextMenuItem) => {
    onMenuItemClick(item);
    document.body.removeChild(contextMenu);
    document.removeEventListener("mousedown", handleOutsideClick);
    document.removeEventListener("click", handleOutsideClick);
  };

  const contextMenuComponent = (
    <CustomContextMenu
      position={position}
      onMenuItemClick={handleMenuItemClick}
      menu={menu}
    />
  );
  const root = ReactDOM.createRoot(contextMenu);
  root.render(contextMenuComponent);
  document.addEventListener("mousedown", handleOutsideClick);
  document.addEventListener("click", handleOutsideClick);
};
