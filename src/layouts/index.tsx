import { Outlet } from "@umijs/max";
import { ConfigProvider, theme } from "antd";
import styles from "./index.less";

const DefaultLayout: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: "#1B56CB",
          colorTextBase: "rgba(241, 243, 255, 0.85)",
          borderRadius: 4,
          colorBorder: "#313337",
          colorBgContainer: "#17191B",
          colorBgContainerDisabled: "#282A2D",
        },
        algorithm: theme.darkAlgorithm,
        components: {
          Select: {
            hoverBorderColor: "#407CE1",
            activeBorderColor: "#1B56CB",
            colorText: "rgba(241,243,255,0.85)",
            colorTextDisabled: "#F1F3FF",
            optionHeight: 22,
            optionLineHeight: 1,
            optionFontSize: 14,
            optionSelectedBg: "#1B56CB",
            optionActiveBg: "#424549",
            selectorBg: "#17191B",
          },
          Radio: {
            colorText: "rgba(241,243,255,0.85)",
          },
          Form: {
            labelColor: "rgba(241,243,255,0.6)",
          },
        },
      }}
    >
      <div className={styles.layout}>
        <Outlet />
      </div>
    </ConfigProvider>
  );
};

export default DefaultLayout;
