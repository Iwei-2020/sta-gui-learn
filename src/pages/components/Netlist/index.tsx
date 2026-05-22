import { fileStore } from "@/mobx/FileStore";
import FileUploadPage from "../FileUploadPage";
import { terminalModel } from "@/mobx/Terminal";
import { observer } from "mobx-react";

const NetlistPage = observer(() => {
  const onAddFiles = (files: string[]) => {
    fileStore.addFiles("verilog", files);
  };
  const onRemoveFile = (file: string) => {
    fileStore.removeFile("verilog", file);
  };
  const onOk = () => {
    fileStore.getFiles("verilog").forEach(async (filePath) => {
      const cmd = `read_verilog -netlist ${filePath}`;
      terminalModel.send(cmd);
    });
    window.close();
  };

  return (
    <FileUploadPage
      title="Netlist Files"
      fileType="verilog"
      files={fileStore.getFiles("verilog")}
      onAddFiles={onAddFiles}
      onRemoveFile={onRemoveFile}
      onOk={onOk}
    />
  );
});

export default NetlistPage;
