import { MyFormItem } from "@/components/MyFormItemContext";
import objectChooser from "@/assets/Icon/objectChooser.png";
import { Button, Checkbox, Col, Form, Input, InputNumber, Row } from "antd";
import styles from "./index.less";
import { useForm } from "antd/es/form/Form";
import { useEffect, useState } from "react";
import { IDataType } from "@/components/ThorTable/interface";
import TagInput from "@/components/TagInput";
import { terminalModel } from "@/mobx/Terminal";
import openTooltip from "@/utils/openTooltip";
import FooterBtn from "../FooterBtn";

const InsertBufferPage: React.FC = () => {
  const [form] = useForm();
  const ChannelName = "insert-buffer";
  const channel = new BroadcastChannel(ChannelName);
  const [objectList, setObjectList] = useState<string[]>([]);

  useEffect(() => {
    channel.addEventListener("message", (event) => {
      const titles = event.data.data.map((item: IDataType) => item.title);
      const oldValue = form.getFieldValue("objectList");
      const listSet = new Set([...oldValue, ...titles]);
      const finalList = Array.from(listSet);
      setObjectList(finalList);
      form.setFieldValue("objectList", finalList);
    });
  });

  const initialValues = {
    netName: "",
    cellName: "",
    objectList: "",
    libCell: "",
    noCells: 1,
    inverterPair: false,
  };

  const openObjectChooser = async () => {
    await window.electronCommon.openSubWindow("object_chooser");
  };

  const handleOk = async () => {
    let hasError = false;
    try {
      await form.validateFields(["objectList", "libCell"]);
    } catch (error) {
      hasError = true;
    }
    if (hasError) {
      return;
    }

    const netName = form.getFieldValue("netName");
    const cellName = form.getFieldValue("cellName");
    const objectList = form.getFieldValue("objectList");
    const libCell = form.getFieldValue("libCell");
    const noCells = form.getFieldValue("noCells");
    const inverterPair = form.getFieldValue("inverterPair");

    const parts: string[] = ["insert_buffer"];
    if (netName) {
      parts.push("-new_net_names", netName);
    }
    if (cellName) {
      parts.push("-new_cell_names", cellName);
    }
    if (libCell) {
      parts.push("-buffer_lib_cell", libCell);
    }
    if (Array.isArray(objectList) && objectList.length > 0) {
      const objectListStr = objectList.join(" ");
      parts.push("-object_list", `{${objectListStr}}`);
    }
    parts.push("-no_of_cells", noCells.toString());
    if (inverterPair) {
      parts.push("-inverter_pair", inverterPair);
    }
    const cmd = parts.join(" ");

    try {
      terminalModel.send("undo_config -enable");
      terminalModel.send(cmd);
    } catch (error) {
      openTooltip("error", error as string);
    }

    window.close();
  };

  const handleReset = () => {
    form.resetFields();
    setObjectList([]);
  };

  return (
    <div className={styles["insert-buffer-container"]}>
      <div className={styles["form-container"]}>
        <Form
          form={form}
          initialValues={initialValues}
          validateTrigger="onChange"
        >
          <MyFormItem name="netName" label="New net names" labelAlign="left">
            <Input className={styles["custom-input"]}></Input>
          </MyFormItem>

          <MyFormItem name="cellName" label="New cell names" labelAlign="left">
            <Input className={styles["custom-input"]}></Input>
          </MyFormItem>

          <div className={styles["object-list"]}>
            <MyFormItem
              name="objectList"
              label="Object List"
              labelAlign="left"
              rules={[{ required: true, message: "" }]}
            >
              <TagInput
                values={objectList}
                onChange={(newItems) => setObjectList(newItems)}
              ></TagInput>
            </MyFormItem>
            <Button
              icon={
                <img
                  src={objectChooser}
                  className={styles["object-chooser-icon"]}
                />
              }
              size="small"
              className={styles["chooser-btn"]}
              onClick={() => openObjectChooser()}
            />
          </div>

          <MyFormItem
            name="libCell"
            label="Buffer lib cell"
            labelAlign="left"
            rules={[{ required: true, message: "" }]}
          >
            <Input className={styles["custom-input"]}></Input>
          </MyFormItem>

          <Row>
            <Col span={16} key="noCells">
              <MyFormItem name="noCells" label="No of cells">
                <InputNumber className={styles["input-number"]} min={1} />
              </MyFormItem>
            </Col>
            <Col span={8} key="inverterPair">
              <MyFormItem name="inverterPair" valuePropName="checked">
                <Checkbox style={{ whiteSpace: "nowrap" }}>
                  {"Inverter pair"}
                </Checkbox>
              </MyFormItem>
            </Col>
          </Row>
        </Form>
      </div>

      <div className={styles["footer-btns"]}>
        <FooterBtn handleOk={handleOk} handleReset={handleReset}></FooterBtn>
      </div>
    </div>
  );
};

export default InsertBufferPage;
