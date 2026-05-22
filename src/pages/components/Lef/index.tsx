import { fileStore } from "@/mobx/FileStore";
import FileUploadPage from "../FileUploadPage";
import { terminalModel } from "@/mobx/Terminal";
import { observer } from "mobx-react";

const LefPage = observer(() => {
  const onAddFiles = (files: string[]) => {
    fileStore.addFiles("lef", files);
  };
  const onRemoveFile = (file: string) => {
    fileStore.removeFile("lef", file);
  };
  const onOk = () => {
    fileStore.getFiles("lef").forEach(async (filePath) => {
      const cmd = `read_lef ${filePath}`;
      terminalModel.send(cmd);
    });
    window.close();
  };

  return (
    <FileUploadPage
      title="Lef Files"
      fileType="lef"
      files={fileStore.getFiles("lef")}
      onAddFiles={onAddFiles}
      onRemoveFile={onRemoveFile}
      onOk={onOk}
    />
  );
});

export default LefPage;
