import { Button } from "antd";
import styles from "./index.less";

interface FooterBtnProps {
  handleOk: () => void;
  handleReset: () => void;
}

const FooterBtn: React.FC<FooterBtnProps> = ({ handleOk, handleReset }) => {
  return (
    <div>
      <Button className={styles["ok-btn"]} onClick={handleOk}>
        OK
      </Button>
      <Button onClick={close} className={styles["cancel-btn"]}>
        Cancel
      </Button>
      <Button className={styles["default-btn"]} onClick={handleReset}>
        Defaults
      </Button>
    </div>
  );
};

export default FooterBtn;
