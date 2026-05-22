import Form, { useForm } from "antd/es/form/Form";
import React, { useEffect, useState } from "react";
import styles from "./index.less";
import { MyFormItem } from "@/components/MyFormItemContext";
import { Button, Input, Select, SelectProps, Tag } from "antd";
import { terminalModel } from "@/mobx/Terminal";
import openTooltip from "@/utils/openTooltip";
import FooterBtn from "../FooterBtn";

const SizeCellPage: React.FC = () => {
  const [form] = useForm();
  const [selectOptions, setSelectOptions] = useState<SelectProps["options"]>();
  const [cellObject, setCellObject] = useState<string[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await window.electronAPI.request({
          type: "objectChooser",
          selectType: "cell",
        });

        if (res.data && Array.isArray(res.data)) {
          const data = res.data.map((item: any, index: number) => {
            return {
              key: `${item[0]}_${index}`,
              label: item[0],
              value: item[0],
            };
          });
          setSelectOptions(data);
        }
      } catch (error) {
        openTooltip("error", error as string);
      }
    };

    fetchData();
  }, []);

  const tagRender = (props: any) => {
    const { label, closable, onClose } = props;
    const onPreventMouseDown = (event: any) => {
      event.preventDefault();
      event.stopPropagation();
    };

    return (
      <Tag
        closable={closable}
        onClose={onClose}
        className={styles["tag"]}
        onMouseDown={onPreventMouseDown}
      >
        {label}
      </Tag>
    );
  };

  const handleOk = async () => {
    let hasError = false;
    try {
      await form.validateFields(["cellObject", "libCell"]);
    } catch (error) {
      hasError = true;
    }
    if (hasError) {
      return;
    }

    const cellObject = form.getFieldValue("cellObject");
    const libCell = form.getFieldValue("libCell");
    const parts: string[] = ["size_cell"];

    if (Array.isArray(cellObject) && cellObject.length > 0) {
      const cellObjectStr = cellObject.join(" ");
      parts.push("-cell_object", `{${cellObjectStr}}`);
    }
    if (libCell) {
      parts.push("-lib_cell_object", libCell);
    }
    const cmd = parts.join(" ");

    try {
      terminalModel.send(cmd);
    } catch (error) {
      openTooltip("error", error as string);
    }

    window.close();
  };

  const handleReset = () => {
    form.resetFields();
    setCellObject([]);
  };

  return (
    <div className={styles["cell-size-container"]}>
      <div className={styles["form-container"]}>
        <Form form={form}>
          <MyFormItem
            name="cellObject"
            label="Cell object"
            labelAlign="left"
            rules={[{ required: true, message: "" }]}
          >
            <Select
              mode="multiple"
              size="small"
              showSearch={true}
              className={styles["custom-item"]}
              onChange={(newItems) => setCellObject(newItems)}
              listHeight={65}
              tagRender={tagRender}
              value={cellObject}
              options={selectOptions}
            ></Select>
          </MyFormItem>
          <MyFormItem
            name="libCell"
            label="Lib cell object"
            labelAlign="left"
            rules={[{ required: true, message: "" }]}
          >
            <Input className={styles["custom-item"]} size="small"></Input>
          </MyFormItem>
        </Form>
      </div>
      <div className={styles["footer-btns"]}>
        <FooterBtn handleOk={handleOk} handleReset={handleReset}></FooterBtn>
      </div>
    </div>
  );
};

export default SizeCellPage;
