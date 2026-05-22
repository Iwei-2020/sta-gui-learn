import { Button, Input, Radio } from "antd";
import styles from "./index.less";
import path from "path";
import { fileStore } from "@/mobx/FileStore";
import { terminalModel } from "@/mobx/Terminal";
import { observer } from "mobx-react";
import { useState } from "react";

const SdcPage = observer(() => {
  const [sdcFile, setSdcFile] = useState<string>();
  const selectFile = async () => {
    const { data: paths } = await window.electronCommon.showDialog(
      "open",
      "sdc"
    );
    if (paths && paths.length) {
      const fileName = path.basename(paths[0]);
      setSdcFile(fileName);
      fileStore.addFiles("sdc", paths);
    }
  };

  const handleOk = () => {
    fileStore.getFiles("sdc").forEach(async (filePath) => {
      const cmd = `read_sdc ${filePath}`;
      terminalModel.addOrderHistory(cmd);
      terminalModel.send(cmd);
    });
    window.close();
  };

  const handleCancel = () => {
    window.close();
  };
  return (
    <div className={styles["sdc-window"]}>
      <div className={styles["sdc-container"]}>
        <div>
          <span style={{ marginRight: "16px" }}>Unload Type:</span>
          <Radio defaultChecked>default</Radio>
          <Radio disabled>multi_mode</Radio>
        </div>
        <div className={styles["files-content"]}>
          <Input className={styles["file-input"]} value={sdcFile} />
          <Button className={styles["browse-btn"]} onClick={selectFile}>
            Browse...
          </Button>
        </div>
      </div>
      <div className={styles["sdc-footer"]}>
        <Button className={styles["ok-btn"]} onClick={handleOk}>
          OK
        </Button>
        <Button className={styles["cancel-btn"]} onClick={handleCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
});

export default SdcPage;
