import { CloseOutlined, PlusOutlined } from "@ant-design/icons";
import { Button, List, Typography } from "antd";
import styles from "./index.less";
import path from "path";

interface FileUploadProps {
  title: string;
  fileType: string;
  files: string[];
  onAddFiles: (files: string[]) => void;
  onRemoveFile: (file: string) => void;
  onOk: () => void;
}

const FileUploadPage: React.FC<FileUploadProps> = ({
  title,
  fileType,
  files,
  onAddFiles,
  onRemoveFile,
  onOk,
}) => {
  const handleAddFiles = async () => {
    const { data: paths } = await window.electronCommon.showDialog(
      "open",
      fileType
    );

    if (paths && paths.length) {
      onAddFiles(paths);
    }
  };

  const handleCancel = () => {
    window.close();
  };
  return (
    <div className={styles["files-window"]}>
      <div className={styles["files-container"]}>
        <div className={styles["files-title"]}>{title}</div>
        <div className={styles["files-content"]}>
          <List
            size="small"
            split={false}
            dataSource={files}
            renderItem={(file, index) => (
              <List.Item
                actions={[
                  <Button
                    key={`delete-${file}`}
                    type="text"
                    className={styles["remove-btn"]}
                    size="small"
                    icon={<CloseOutlined />}
                    onClick={() => onRemoveFile(file)}
                  />,
                ]}
              >
                <Typography.Text ellipsis>
                  {path.basename(file)}
                </Typography.Text>
              </List.Item>
            )}
          />
        </div>
        <Button
          className={styles["add-btn"]}
          icon={<PlusOutlined />}
          onClick={handleAddFiles}
        >
          Add file
        </Button>
      </div>
      <div className={styles["files-footer"]}>
        <Button className={styles["ok-btn"]} onClick={onOk}>
          OK
        </Button>
        <Button className={styles["cancel-btn"]} onClick={handleCancel}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default FileUploadPage;
