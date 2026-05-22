import { flexLayoutManager } from "@/mobx";
import { FlexLayoutWrapper } from "../components/FlexLayoutWrapper";
import styles from "./index.less";

const MainContent = () => {
  return (
    <div className={styles["main-container"]}>
      <FlexLayoutWrapper model={flexLayoutManager.model!} />
    </div>
  );
};

export default MainContent;
