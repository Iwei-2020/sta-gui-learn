import { Button } from "antd";
import styles from "./index.less";
import question from "@/assets/Icon/question.png";
import { terminalModel } from "@/mobx/Terminal";
import openTooltip from "@/utils/openTooltip";

const ExitPage = () => {
  const exitContent = "Do you really want to exit?";

  const handleHide = async () => {
    await window.electronCommon.minimizeGui();
  };

  const handleExit = async () => {
    try {
      await window.electronCommon.closeGui();
      terminalModel.send("exit");
      window.close();
    } catch (error) {
      openTooltip("error", error as string);
    }
  };
  const cancel = () => {
    window.close();
  };

  return (
    <div className={styles["exit-page"]}>
      <div className={styles["exit-content"]}>
        <img src={question} className={styles["exit-icon"]} />
        <div style={{ fontSize: "14px" }}>{exitContent}</div>
      </div>
      <div className={styles["exit-footer"]}>
        <Button
          className={[styles["btn-style"], styles["hide-btn"]].join(" ")}
          onClick={handleHide}
        >
          {"Hide GUI"}
        </Button>
        <Button
          onClick={cancel}
          className={[styles["btn-style"], styles["cancel-btn"]].join(" ")}
        >
          Cancel
        </Button>
        <Button
          className={[styles["btn-style"], styles["exit-btn"]].join(" ")}
          onClick={handleExit}
        >
          Exit
        </Button>
      </div>
    </div>
  );
};

export default ExitPage;
