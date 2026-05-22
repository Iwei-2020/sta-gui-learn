import { Button, Spin } from "antd";
import styles from "./index.less";
import ThorTable from "@/components/ThorTable";
import { IDataType, ThorTableColumns } from "@/components/ThorTable/interface";
import { useSearchParams } from "@umijs/max";
import { useEffect, useRef, useState } from "react";
import { LoadingOutlined } from "@ant-design/icons";

const ObjectChooser: React.FC = () => {
  const [searchParams] = useSearchParams();
  const tableRef = useRef<any>(null);
  const channel = new BroadcastChannel("timing-report");
  const [objectColumns, setObjectColumns] = useState<ThorTableColumns>([]);
  const [selectType, setSelectType] = useState<string>();
  const [chooserData, setChooserData] = useState<IDataType[]>([]);

  const nameMap = new Map<string, string>([
    ["pin", "pinName"],
    ["port", "portName"],
    ["cell", "cellName"],
    ["net", "netName"],
    ["clock", "clockName"],
  ]);

  useEffect(() => {
    const type = searchParams.get("selectType") as string;
    setSelectType(type);
    const fetchData = async () => {
      try {
        const res = await window.electronAPI.request({
          type: "objectChooser",
          selectType: type,
        });
        const nameField = nameMap.get(type) as string;

        if (res.data && Array.isArray(res.data)) {
          const data = res.data.map((item: any, index: number) => {
            return {
              key: `${item[0]}_${index}`,
              title: item[0],
              rowKey: `${item[0]}_${index}`,
              [nameField]: item[0],
            };
          });
          setChooserData(data);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchData();
  }, []);

  // pin、port、net、cell、clock与Timing窗体选择内容绑定
  useEffect(() => {
    if (selectType) {
      const columnMap: {
        [key: string]: { title: string; key: string; dataIndex: string }[];
      } = {
        pin: [{ title: "Pin Name", key: "pinName", dataIndex: "pinName" }],
        port: [{ title: "Port Name", key: "portName", dataIndex: "portName" }],
        net: [{ title: "Net Name", key: "netName", dataIndex: "netName" }],
        cell: [{ title: "Cell Name", key: "cellName", dataIndex: "cellName" }],
        clock: [
          { title: "Clock Name", key: "clockName", dataIndex: "clockName" },
        ],
      };

      setObjectColumns(columnMap[selectType]);
    }
  }, [selectType]);

  const handleOk = async () => {
    const chooseType = searchParams.get("chooseType");
    if (tableRef.current) {
      const selectedItems = tableRef.current.getSelectedItems() as IDataType[];
      channel.postMessage({
        data: selectedItems.reduce(
          (old, cur) => `${old} ${cur!.title}`,
          `${chooseType}:`
        ),
      });
    }
    window.close();
  };

  return (
    <div className={styles["object-container"]}>
      <div className={styles["chooser-area"]}>
        {chooserData && chooserData.length > 0 ? (
          <ThorTable
            autoWidth
            selectionMode="multi"
            columns={objectColumns}
            dataSource={chooserData}
            ref={tableRef}
          />
        ) : (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",

              width: "100%",
            }}
          >
            <Spin indicator={<LoadingOutlined spin />} />
          </div>
        )}
      </div>
      <div className={styles["footer-btns"]}>
        <Button className={styles["ok-btn"]} onClick={handleOk}>
          OK
        </Button>
        <Button className={styles["cancel-btn"]} onClick={close}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default ObjectChooser;
