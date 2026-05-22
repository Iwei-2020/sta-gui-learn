import { MenuItemType } from "antd/es/menu/interface";
import { useState } from "react";

export interface INodeTypeSelectHookResult {
  menuItems: MenuItemType[];
  currentNodeType: string | number;
  setCurrentNodeType: React.Dispatch<React.SetStateAction<string | number>>;
}

export const useNodeTypeSelect = (
  menuItems: MenuItemType[],
  initValue?: string
) => {
  const [currentNodeType, setCurrentNodeType] = useState<string | number>(
    initValue || (menuItems[0]?.key as string) || ""
  );
  return {
    menuItems,
    currentNodeType,
    setCurrentNodeType,
  };
};
