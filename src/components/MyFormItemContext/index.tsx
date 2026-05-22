import type { FormItemProps } from "antd";
import { Form } from "antd";
import { createContext, useContext, useMemo } from "react";

const MyFormItemContext = createContext<(string | number)[]>([]);

interface MyFormItemGroupProps {
  prefix: string | number | (string | number)[];
}

/**
 * 解析prefix
 * @param str 传入的prefix字符串or字符串数组
 * @returns 返回prefix字符串or字符串数组
 */
function toArr(
  str: string | number | (string | number)[]
): (string | number)[] {
  return Array.isArray(str) ? str : [str];
}

/**
 * 封装后的FormItemGroup 用于包裹Form.user.username的多层结构
 */
export const MyFormItemGroup: React.FC<
  React.PropsWithChildren<MyFormItemGroupProps>
> = ({ prefix, children }) => {
  const prefixPath = useContext(MyFormItemContext);
  const concatPath = useMemo(
    () => [...prefixPath, ...toArr(prefix)],
    [prefixPath, prefix]
  );

  return (
    <MyFormItemContext.Provider value={concatPath}>
      {children}
    </MyFormItemContext.Provider>
  );
};

/**
 * 封装后的FormItem 用于实现Form.user.username的多层结构的子项
 */
export const MyFormItem = ({ name, ...props }: FormItemProps) => {
  const prefixPath = useContext(MyFormItemContext);
  const concatName =
    name !== undefined ? [...prefixPath, ...toArr(name)] : undefined;

  return <Form.Item name={concatName} {...props} />;
};
