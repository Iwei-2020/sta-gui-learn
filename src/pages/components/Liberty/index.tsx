import FileUploadPage from "../FileUploadPage";
import { terminalModel } from "@/mobx/Terminal";
import { fileStore } from "@/mobx/FileStore";
import { observer } from "mobx-react";

const LibertyPage = observer(() => {
  const onAddFiles = (files: string[]) => {
    fileStore.addFiles("liberty", files);
  };
  const onRemoveFile = (file: string) => {
    fileStore.removeFile("liberty", file);
  };
  const onOk = () => {
    fileStore.getFiles("liberty").forEach(async (filePath) => {
      const cmd = `read_liberty ${filePath}`;
      terminalModel.send(cmd);
    });
    window.close();
  };

  return (
    <FileUploadPage
      title="Liberty Files"
      fileType="lib"
      files={fileStore.getFiles("liberty")}
      onAddFiles={onAddFiles}
      onRemoveFile={onRemoveFile}
      onOk={onOk}
    />
  );
});

export default LibertyPage;
