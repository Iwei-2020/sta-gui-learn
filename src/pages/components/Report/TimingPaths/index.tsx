import { MyFormItem, MyFormItemGroup } from "@/components/MyFormItemContext";
import styles from "./index.less";
import objectChooser from "@/assets/Icon/objectChooser.png";
import { THROUGH_HEIGHT, chooserOptions } from "./const";
import { Button, Col, CollapseProps, Form, Input, Select } from "antd";
import MyReportCollapse from "../ReportCollapse";
import ReportOutputOpt from "../ReportOutputOpt";
import { useForm } from "antd/es/form/Form";
import ReportOptions from "../ReportOptions";
import { CloseCircleOutlined, PlusOutlined } from "@ant-design/icons";
import { useEffect, useRef, useState } from "react";
import openObjectChooser from "@/utils/openObjectChooser";
import openTooltip from "@/utils/openTooltip";

const TimingPathsPage = () => {
  const [form] = useForm();
  const containerRef = useRef<HTMLDivElement>(null);
  const [chooserItems, setChooserItems] = useState(chooserOptions);
  const [throughCount, setThroughCount] = useState(0);
  const [timingDisabled, setTimingDisabled] = useState<boolean>(true);

  // 表单初始值
  const initialValues = {
    reportPaths: {
      fromChooserPath: "from",
      toChooserPath: "to",
      throughChooserPath: "through",
      fromChooserType: "pin",
      toChooserType: "pin",
      throughChooserType: "pin",
      fromChooserValue: "",
      toChooserValue: "",
      throughChooserValue: "",
    },
    reportOptions: {
      worstPaths: 1,
      slackLesser: 0,
      maxPaths: 10,
      pathType: "full",
      delayType: "max",
      sortBy: "group",
    },
    outputOptions: {
      toFile: false,
      appendFile: true,
      exportPath: "Report.txt",
    },
  };

  const ChannelName = "timing-report";
  const channel = new BroadcastChannel(ChannelName);
  useEffect(() => {
    channel.addEventListener("message", (event) => {
      const content = event.data;
      const type = content.data.split(":")[0];
      const data = content.data.split(":")[1];
      const oldValue = form.getFieldValue(["reportPaths", type]);
      form.setFieldValue(["reportPaths", type], oldValue + data);
    });
  }, []);

  const items: CollapseProps["items"] = [
    {
      key: "report-options",
      label: "Report options",
      children: <ReportOptions />,
    },
    {
      key: "output-options",
      label: "Output options",
      children: <ReportOutputOpt />,
    },
  ];

  const addThrough = () => {
    const newCount = throughCount + 1;
    setChooserItems([
      ...chooserItems,
      {
        label: "Through",
        pathType: `throughChooserPath-${newCount}`,
        type: `throughChooserType-${newCount}`,
        value: `throughChooserValue-${newCount}`,
        options: [
          { value: "through", label: "Through" },
          { value: "riseThrough", label: "Rise Through" },
          { value: "fallThrough", label: "Fall Through" },
        ],
        isRemovable: true,
      },
    ]);

    // 新增through设置初始值
    form.setFieldsValue({
      reportPaths: {
        [`throughChooserPath-${newCount}`]: "through",
        [`throughChooserType-${newCount}`]: "pin",
        [`throughChooserValue-${newCount}`]: "",
      },
    });

    setThroughCount(newCount);

    // 新增through大于两个时，窗体高度不变，通过滚动条控制
    if (newCount <= 2) {
      window.electronCommon.adjustTimingWindowHeight(THROUGH_HEIGHT);
    }
  };

  const removeThrough = (index: number) => {
    setChooserItems((prev) => prev.filter((_, i) => i !== index));
    if (throughCount > 0) {
      const newCount = throughCount - 1;
      setThroughCount(newCount);

      if (newCount < 2) {
        window.electronCommon.adjustTimingWindowHeight(-THROUGH_HEIGHT);
      }
    }
  };

  useEffect(() => {
    const chooserDom = containerRef.current;
    if (chooserDom) {
      // 滚动到最底部
      chooserDom.scrollTop = chooserDom.scrollHeight;
    }
  }, [chooserItems]);

  const topChooserNode = (
    <div className={styles["chooser-panel"]}>
      <div ref={containerRef} className={styles["chooser-container"]}>
        <MyFormItemGroup prefix={["reportPaths"]}>
          {chooserItems.map((item, index) => {
            return (
              <div className={styles["chooser-item"]} key={`${item}-${index}`}>
                <MyFormItem name={item.pathType}>
                  <Select
                    className={styles["chooser-path"]}
                    options={item.options}
                  />
                </MyFormItem>
                <MyFormItem name={item.type}>
                  {item.type === "fromChooserType" ||
                  item.type === "toChooserType" ? (
                    <Select
                      className={styles["chooser-element"]}
                      options={[
                        { value: "pin", label: "pin" },
                        { value: "port", label: "port" },
                        { value: "net", label: "net" },
                        { value: "cell", label: "cell" },
                        { value: "clock", label: "clock" },
                      ]}
                    />
                  ) : (
                    <Select
                      className={styles["chooser-element"]}
                      options={[
                        { value: "pin", label: "pin" },
                        { value: "net", label: "net" },
                        { value: "cell", label: "cell" },
                      ]}
                    />
                  )}
                </MyFormItem>
                <Col flex={1}>
                  <MyFormItem name={item.value}>
                    <Input size="small" />
                  </MyFormItem>
                </Col>
                <Button
                  icon={
                    <img
                      src={objectChooser}
                      className={styles["object-chooser-icon"]}
                    />
                  }
                  size="small"
                  onClick={() => {
                    const selectType = form.getFieldValue([
                      "reportPaths",
                      item.type,
                    ]);
                    openObjectChooser(item.value, selectType, ChannelName);
                  }}
                ></Button>
                <Button
                  className={styles["selection-btn"]}
                  size="small"
                  disabled
                >
                  Selection
                </Button>

                {/* 保持每行末尾宽度一致 */}
                {throughCount > 0 && (
                  <div className={styles["remove-btn"]}>
                    {item.isRemovable && (
                      <CloseCircleOutlined
                        onClick={() => removeThrough(index)}
                      />
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </MyFormItemGroup>
      </div>
      <Button
        className={styles["add-btn"]}
        icon={<PlusOutlined />}
        onClick={addThrough}
      >
        Add Through
      </Button>
    </div>
  );

  useEffect(() => {
    //主窗体 - report timing窗体传递数据
    const terminalChannel = new BroadcastChannel("timing-state");

    const handleMessage = (event: MessageEvent) => {
      const { type, timingDisabled } = event.data;

      if (type === "report-timing-state") {
        setTimingDisabled(timingDisabled);
      }
    };
    terminalChannel.addEventListener("message", handleMessage);

    // 确保再次打开窗体时重新传递timingDisaled值
    terminalChannel.postMessage({
      type: "request-current-timing-state",
    });
    return () => {
      terminalChannel.removeEventListener("message", handleMessage);
      terminalChannel.close();
    };
  }, []);

  const handleOk = () => {
    if (timingDisabled) {
      openTooltip(
        "error",
        "Reuired files are missing. Please update Liberty, Netlist and SDC."
      );
      return;
    }

    const channel = new BroadcastChannel("path-summary");
    const values = form.getFieldsValue();
    const winName =
      form.getFieldValue(["reportOptions", "winName"]) || "Path Summary";
    channel.postMessage({ formValues: values, winName: winName });

    window.close();
  };

  return (
    <div className={styles["timing-container"]}>
      <Form form={form} initialValues={initialValues} requiredMark={false}>
        {topChooserNode}
        <MyReportCollapse
          items={items}
          defaultActiveKey={["report-options", "output-options"]}
        ></MyReportCollapse>
      </Form>
      <div className={styles["btn-box"]}>
        <Button className={styles["ok-btn"]} onClick={() => handleOk()}>
          OK
        </Button>
        <Button onClick={close} className={styles["cancel-btn"]}>
          Cancel
        </Button>
        <Button
          className={styles["default-btn"]}
          onClick={() => form.resetFields()}
        >
          Defaults
        </Button>
      </div>
    </div>
  );
};

export default TimingPathsPage;
