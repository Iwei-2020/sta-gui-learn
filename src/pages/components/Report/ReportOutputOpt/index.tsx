import { Button, Checkbox, Form, Input } from "antd";
import React from "react";
import {
  MyFormItem,
  MyFormItemGroup,
} from "../../../../components/MyFormItemContext";
import styles from "./index.less";

const ReportOutputOpt: React.FC = () => {
  const form = Form.useFormInstance();

  /** 表单中to file 是否被勾选 */
  const toFileStatus = Form.useWatch(["outputOptions", "toFile"], {
    form,
    preserve: true,
  });

  const handleClick = async () => {
    const { data: exportPath } = await window.electronCommon.showDialog(
      "save",
      "txt"
    );
    if (exportPath) {
      form.setFieldValue(["outputOptions", "exportPath"], exportPath);
    }
  };

  return (
    <div className={styles["custom-output-options"]}>
      <MyFormItemGroup prefix={"outputOptions"}>
        <div className={styles["to-file"]}>
          <MyFormItem name="toFile" valuePropName="checked">
            <Checkbox>To file</Checkbox>
          </MyFormItem>
          <div className={styles["to-file-mid"]}>
            <MyFormItem name="exportPath" style={{ marginBottom: "4px" }}>
              <Input size="small" disabled={!toFileStatus}></Input>
            </MyFormItem>
            <MyFormItem name="appendFile" valuePropName="checked">
              <Checkbox disabled={!toFileStatus}>Append to file</Checkbox>
            </MyFormItem>
          </div>
          <Button
            size="small"
            className={styles["upload-button"]}
            disabled={!toFileStatus}
            onClick={handleClick}
          >
            Browse...
          </Button>
        </div>
      </MyFormItemGroup>
    </div>
  );
};

export default ReportOutputOpt;
