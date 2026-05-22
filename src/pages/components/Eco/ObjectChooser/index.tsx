import {
  NodeTypeSelect,
  defaultNodeTypeMenu,
} from "@/components/NodeTypeSelect";
import styles from "./index.less";
import { useNodeTypeSelect } from "@/components/NodeTypeSelect/useNodeTypeSelect";
import ThorTable from "@/components/ThorTable";
import { useEffect, useState } from "react";
import { IDataType, ThorTableColumns } from "@/components/ThorTable/interface";
import openTooltip from "@/utils/openTooltip";
import { Button } from "antd";
import { uniqBy } from "lodash";
import { COLUMN_CONFIG, SelectType, TYPE_NAME } from "./const";

const ObjectChooserPage = () => {
  const nodeTypeSelectProps = useNodeTypeSelect(defaultNodeTypeMenu, "net");
  const currentType = nodeTypeSelectProps.currentNodeType as SelectType;

  const [finalColumns, setFinalColumns] = useState<ThorTableColumns>(() => [
    COLUMN_CONFIG["net"],
  ]);
  const [chooserData, setChooserData] = useState<IDataType[]>([]);
  const [filterData, setFilterData] = useState<IDataType[]>([]);
  const [removeKeys, setRemoveKeys] = useState<Array<string>>([]);

  useEffect(() => {
    setFinalColumns([COLUMN_CONFIG[currentType]]);
    const fetchData = async () => {
      try {
        const res = await window.electronAPI.request({
          type: "objectChooser",
          selectType: currentType,
        });
        const nameField = TYPE_NAME[currentType];

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
        openTooltip("error", error as string);
      }
    };

    fetchData();
  }, [currentType]);

  const [selectedRows, setSelectedRows] = useState();

  const handleSelect = (selectedItems: any) => {
    setSelectedRows(selectedItems);
  };

  const handleChoose = () => {
    if (selectedRows)
      setFilterData((old) => uniqBy([...old, ...selectedRows], "key"));
  };

  const handleRemove = (removeKeys: Array<string>) => {
    setFilterData((preSource) =>
      preSource.filter((data) => !removeKeys.includes(data.key))
    );
    setRemoveKeys([]);
  };

  const channel = new BroadcastChannel("insert-buffer");
  const handleOk = () => {
    channel.postMessage({ data: filterData });
    window.close();
  };

  return (
    <div className={styles["chooser-wrapper"]}>
      <div className={styles["top-panel"]}>
        <NodeTypeSelect {...nodeTypeSelectProps} />
        <div className={styles["chooser-table"]}>
          <ThorTable
            columns={finalColumns}
            dataSource={chooserData}
            selectionMode="multi"
            handleSelect={(selectedItems) => handleSelect(selectedItems)}
          ></ThorTable>
        </div>
      </div>
      <Button className={styles["choose-btn"]} onClick={handleChoose}>
        Click to Choose Objects
      </Button>
      <div className={styles["bottom-panel"]}>
        <ThorTable
          columns={finalColumns}
          dataSource={filterData}
          selectionMode="multi"
          handleSelect={(list: IDataType[]) => {
            setRemoveKeys(list.map((item) => item.key));
          }}
        ></ThorTable>
      </div>
      <Button
        className={styles["choose-btn"]}
        onClick={() => handleRemove(removeKeys)}
        disabled={removeKeys.length > 0 ? false : true}
      >
        Click to Remove Objects
      </Button>

      <div className={styles["footer-btns"]}>
        <Button className={styles["btn-custom"]} onClick={handleOk}>
          OK
        </Button>
        <Button className={styles["btn-custom"]} onClick={close}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

export default ObjectChooserPage;
