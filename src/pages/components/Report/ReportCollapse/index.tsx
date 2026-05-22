import { Collapse, CollapseProps, ConfigProvider } from "antd";
import React, { memo } from "react";
import styles from "./index.less";

/**
 * 自定义 Collapse 组件，为了统一管理 report 中的 collapse 的样式
 * 防止样式污染
 */

interface MyReportCollapseProps {
  items?: CollapseProps["items"];
  defaultActiveKey?: Array<string | number> | string | number;
}

const MyReportCollapse: React.FC<MyReportCollapseProps> = memo((props) => {
  const { items, defaultActiveKey } = props;

  return (
    <div className={styles["custom-collapse"]}>
      <ConfigProvider
        theme={{
          components: {
            Form: {
              labelColor: "rgba(241,243,255,0.6)",
              labelHeight: 22,
              controlHeight: 22,
              itemMarginBottom: 8,
            },
            Checkbox: {
              colorText: "rgba(241,243,255,0.6)",
              colorTextDisabled: "rgba(241,243,255,0.25)",
            },
          },
        }}
      >
        <Collapse
          items={items}
          defaultActiveKey={defaultActiveKey}
          bordered={false}
        ></Collapse>
      </ConfigProvider>
    </div>
  );
});

export default MyReportCollapse;
