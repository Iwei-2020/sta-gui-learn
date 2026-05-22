import { MyFormItem, MyFormItemGroup } from "@/components/MyFormItemContext";
import { Checkbox, Col, Input, InputNumber, Row, Select } from "antd";
import { inputOptions, radioItems, selectOptions } from "./const";
import styles from "./index.less";
import { useEffect, useState } from "react";
import { ISelectedHierarchy } from "@/mobx/Hierarchy/interface";

interface IGroupOptions {
  value: string;
  label: string;
}

const ReportOptions = () => {
  const [groupData, setGroupData] = useState<IGroupOptions[]>([]);
  useEffect(() => {
    const fetchData = async () => {
      const res = await window.electronAPI.request({
        type: "pathGroup",
      });
      if (res.data && Array.isArray(res.data[1])) {
        const options = res.data[1].map((item: string) => ({
          value: item,
          label: item,
        }));
        setGroupData(options);
      }
    };
    fetchData();
  }, []);

  return (
    <MyFormItemGroup prefix={"reportOptions"}>
      <Row>
        <MyFormItem name={"winName"} label="Window name">
          <Input
            placeholder="Enter Path Summary Name"
            className={styles["window-name-input"]}
          />
        </MyFormItem>
      </Row>
      <Row justify="space-between">
        {inputOptions.map((item, index) => {
          if (index % 2 === 0) {
            return (
              <Col key={`${item.value}`} span={10}>
                <MyFormItem
                  labelAlign="left"
                  label={item.label}
                  labelCol={{ flex: "176px" }}
                  name={item.value}
                  rules={[
                    { required: true, message: "" },
                    {
                      validator: (_, value) => {
                        if (!value || /^[1-9]\d*$/.test(value.toString())) {
                          if (value > 999999) {
                            return Promise.reject();
                          }
                          return Promise.resolve();
                        }
                        return Promise.reject();
                      },
                    },
                  ]}
                >
                  <InputNumber
                    size="small"
                    style={{ width: "120px" }}
                    min={1}
                    max={999999}
                    step={1}
                    precision={0}
                  />
                </MyFormItem>
              </Col>
            );
          } else {
            return (
              <Col key={`${item.value}`} span={10}>
                <MyFormItem
                  label={item.label}
                  name={item.value}
                  labelAlign="left"
                  labelCol={{ flex: "132px" }}
                >
                  <InputNumber size="small" style={{ width: "120px" }} />
                </MyFormItem>
              </Col>
            );
          }
        })}
      </Row>
      <Row justify="space-between">
        {selectOptions.map((item, index) => {
          let labelFlex = "132px";
          if (item.key === "group") {
            item.selectOption = groupData;
          }
          let content = (
            <Select
              size="small"
              style={{ width: 120, height: 24 }}
              options={item.selectOption}
            />
          );

          if (index % 2 === 0) {
            labelFlex = "80px";
          }
          if (item.key === "corner") {
            content = <Input size="small" style={{ width: 120 }} />;
          }

          return (
            <Col span={10} key={item.key}>
              <MyFormItem
                name={item.key}
                label={item.label}
                labelAlign="left"
                labelCol={{ flex: labelFlex }}
              >
                {content}
              </MyFormItem>
            </Col>
          );
        })}
      </Row>

      <Row>
        <MyFormItem name="significantDigits" label="Significant digits">
          <InputNumber
            size="small"
            style={{ width: "84px", height: "24px" }}
            min={0}
          />
        </MyFormItem>
      </Row>
      <Row justify="space-between">
        {radioItems.map((item, index) => {
          return (
            <Col span={10} key={`checkGroup-index-${index}`}>
              <MyFormItem
                labelAlign="left"
                name={item.value}
                valuePropName="checked"
              >
                <Checkbox style={{ whiteSpace: "nowrap" }}>
                  {item.label}
                </Checkbox>
              </MyFormItem>
            </Col>
          );
        })}
      </Row>
    </MyFormItemGroup>
  );
};

export default ReportOptions;
