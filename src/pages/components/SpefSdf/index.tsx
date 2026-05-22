import { fileStore } from "@/mobx/FileStore";
import FileUploadPage from "../FileUploadPage";
import { terminalModel } from "@/mobx/Terminal";
import { observer } from "mobx-react";

const fileCmdMap: Record<string, string> = {
  sdf: "read_sdf",
  spef: "read_spef",
};

const SpefSdfPage = observer(() => {
  const onAddFiles = (files: string[]) => {
    fileStore.addFiles("spef_sdf", files);
  };
  const onRemoveFile = (file: string) => {
    fileStore.removeFile("spef_sdf", file);
  };
  const onOk = () => {
    fileStore.getFiles("spef_sdf").forEach(async (filePath) => {
      const ext = filePath
        .substring(filePath.lastIndexOf(".") + 1)
        .toLowerCase();

      const cmdPrefix = fileCmdMap[ext];
      if (!cmdPrefix) {
        return;
      }

      const cmd = `${cmdPrefix} ${filePath}`;
      terminalModel.send(cmd);
    });
    window.close();
  };

  return (
    <FileUploadPage
      title="Spef/Sdf Files"
      fileType="spef/sdf"
      files={fileStore.getFiles("spef_sdf")}
      onAddFiles={onAddFiles}
      onRemoveFile={onRemoveFile}
      onOk={onOk}
    />
  );
});

export default SpefSdfPage;
