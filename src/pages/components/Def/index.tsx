import { fileStore } from "@/mobx/FileStore";
import FileUploadPage from "../FileUploadPage";
import { terminalModel } from "@/mobx/Terminal";
import { observer } from "mobx-react";

const DefPage = observer(() => {
  const onAddFiles = (files: string[]) => {
    fileStore.addFiles("def", files);
  };
  const onRemoveFile = (file: string) => {
    fileStore.removeFile("def", file);
  };
  const onOk = () => {
    fileStore.getFiles("def").forEach(async (filePath) => {
      const cmd = `read_def ${filePath}`;
      terminalModel.send(cmd);
    });
    window.close();
  };

  return (
    <FileUploadPage
      title="Def Files"
      fileType="def"
      files={fileStore.getFiles("def")}
      onAddFiles={onAddFiles}
      onRemoveFile={onRemoveFile}
      onOk={onOk}
    />
  );
});

export default DefPage;
