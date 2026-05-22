import { Button, Form, InputNumber, Select, SelectProps, Tag } from "antd";
import styles from "./index.less";
import { useForm } from "antd/es/form/Form";
import { MyFormItem } from "@/components/MyFormItemContext";
import { useEffect, useState } from "react";
import openTooltip from "@/utils/openTooltip";
import { terminalModel } from "@/mobx/Terminal";
import FooterBtn from "../FooterBtn";

const RemoveBufferPage = () => {
  const [form] = useForm();
  const [selectedType, setSelectedType] = useState<string>("from");
  const [toLevel, setToLevel] = useState<string>("to");
  const [objectData, setObjectData] = useState<SelectProps[]>();
  const [toSelectObjet, setToSelctObject] = useState<SelectProps[]>();

  const initialValues = {
    typeSelect: "from",
    toLevel: "to",
  };

  const typeOptions = [
    {
      value: "from",
      label: "from",
    },
    {
      value: "net",
      label: "net",
    },
    {
      value: "cellList",
      label: "cell list",
    },
  ];

  const toLevelOptions = [
    { value: "to", label: "to" },
    { value: "level", label: "level" },
  ];

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

  useEffect(() => {
    const fetchData = async (objectType: string) => {
      try {
        const res = await window.electronAPI.request({
          type: "objectChooser",
          selectType: objectType,
        });

        if (res.data && Array.isArray(res.data)) {
          const data = res.data.map((item: any, index: number) => {
            return {
              key: `${item[0]}_${index}`,
              value: item[0],
              label: item[0],
            };
          });
          return data;
        }
      } catch (error) {
        openTooltip("error", error as string);
        return [];
      }
    };

    const loadData = async () => {
      if (selectedType === "from") {
        // 并行获取 pin 和 port 数据
        const [pinData, portData] = await Promise.all([
          fetchData("pin"),
          fetchData("port"),
        ]);

        // 合并数据
        if (pinData && portData) {
          const combinedData = [...pinData, ...portData];
          setObjectData(combinedData);
        }
      } else if (selectedType === "net") {
        const data = await fetchData("net");
        setObjectData(data);
      } else {
        const data = await fetchData("cell");
        setObjectData(data);
      }
    };

    loadData();
  }, [selectedType]);

  const handleOk = () => {
    const parts: string[] = ["remove_buffer"];
    const selectedObject = form.getFieldValue("objectSelect");
    const levelNum = form.getFieldValue("levelNum");
    const toObject = form.getFieldValue("toSelect");

    switch (selectedType) {
      case "from": {
        parts.push("-from", `{${selectedObject}}`);
        break;
      }

      case "net": {
        parts.push("-net", selectedObject);
        break;
      }
      case "cellList": {
        parts.push("-cell_list", selectedObject);
        break;
      }
    }

    if (toLevel === "to") {
      if (Array.isArray(toObject) && toObject.length > 0) {
        const toObjectStr = toObject.join(" ");
        parts.push("-to", `{${toObjectStr}}`);
      }
    } else if (toLevel) {
      if (levelNum) {
        parts.push("-level", levelNum);
      }
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
    setObjectData([]);
    setToSelctObject([]);
  };

  return (
    <div className={styles["remove-buffer-container"]}>
      <div className={styles["form-container"]}>
        <Form form={form} initialValues={initialValues}>
          <div className={styles["first-item"]}>
            <MyFormItem name="typeSelect">
              <Select
                options={typeOptions}
                className={styles["type-select"]}
                onChange={(value) => {
                  setSelectedType(value);
                }}
              />
            </MyFormItem>

            <MyFormItem name="objectSelect">
              <Select
                className={styles["object-select"]}
                options={objectData}
                listHeight={65}
                showSearch={true}
              />
            </MyFormItem>
          </div>
          {selectedType !== "cellList" ? (
            <div className={styles["second-item"]}>
              <MyFormItem name="toLevel">
                <Select
                  options={toLevelOptions}
                  className={styles["to-level-select"]}
                  onChange={(value) => {
                    if (value !== "to") {
                      setToSelctObject([]);
                    }
                    setToLevel(value);
                  }}
                />
              </MyFormItem>

              {toLevel === "to" ? (
                <MyFormItem name="toSelect">
                  <Select
                    mode="multiple"
                    size="small"
                    className={styles["to-select"]}
                    options={objectData}
                    listHeight={45}
                    showSearch={true}
                    tagRender={tagRender}
                    value={toSelectObjet}
                    onChange={(newItems) => {
                      setToSelctObject(newItems);
                    }}
                  />
                </MyFormItem>
              ) : (
                <MyFormItem name="levelNum">
                  <InputNumber
                    className={styles["level-number"]}
                    min={1}
                    size="small"
                  />
                </MyFormItem>
              )}
            </div>
          ) : (
            <div className={styles["second-item"]}>
              <div className={styles["level-label"]}>level</div>

              <MyFormItem name="levelNum">
                <InputNumber
                  className={styles["level-number"]}
                  min={1}
                  size="small"
                />
              </MyFormItem>
            </div>
          )}
        </Form>
      </div>
      <div className={styles["footer-btns"]}>
        <FooterBtn handleOk={handleOk} handleReset={handleReset}></FooterBtn>
      </div>
    </div>
  );
};

export default RemoveBufferPage;
