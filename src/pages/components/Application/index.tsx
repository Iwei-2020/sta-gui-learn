import React, { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./index.less";
import { Button, Input, Select, Table } from "antd";
import openTooltip from "@/utils/openTooltip";
import { terminalModel } from "@/mobx/Terminal";

interface TableDataItem {
  key: string;
  variable: string;
  value: string | number | boolean;
  originalValue?: any; // 存储初始值
  rowKey: string;
}

const ApplicationPage: React.FC = () => {
  const { Search } = Input;
  const [tableData, setTableData] = useState<TableDataItem[]>([]);
  const [modifiedRows, setModifiedRows] = useState<Map<string, TableDataItem>>(
    new Map()
  ); // 跟踪修改过的行
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  useEffect(() => {
    const fetchConfigs = async () => {
      try {
        const configs = await window.electronAPI.request({
          type: "applicationVariables",
        });

        if (configs.data && Array.isArray(configs.data)) {
          const res = configs.data.map((item) => ({
            key: item.name,
            variable: item.name,
            value: item.value,
            originalValue: item.value,
            rowKey: item.name,
          }));

          setTableData(res);
        }
      } catch (error) {
        openTooltip("error", error as string);
      }
    };
    fetchConfigs();
  }, []);

  const hasModifications = modifiedRows.size > 0;

  // 检查值是否被修改过
  const isValueModified = (record: TableDataItem): boolean => {
    return (
      modifiedRows.has(record.key) || record.value !== record.originalValue
    );
  };

  const handleValueChange = (
    key: string,
    newValue: string | boolean | number
  ) => {
    setTableData((prevData) =>
      prevData.map((item) => {
        if (item.key === key) {
          const modifiedItem = { ...item, value: newValue };

          if (item.value !== newValue) {
            setModifiedRows((prev) => {
              const newMap = new Map(prev);
              newMap.set(key, modifiedItem);
              return newMap;
            });
          }
          return modifiedItem;
        }
        return item;
      })
    );
  };

  const getModifiedData = (): TableDataItem[] => {
    return Array.from(modifiedRows.values());
  };

  const columns = [
    {
      title: "Variable",
      dataIndex: "variable",
      ellipsis: true,
      sorter: (a: any, b: any) => {
        const strA = String(a.variable || "").toLowerCase();
        const strB = String(b.variable || "").toLowerCase();
        return strA.localeCompare(strB);
      },
    },
    {
      title: "Value",
      dataIndex: "value",
      ellipsis: true,
      render: (_: any, record: TableDataItem) => {
        const isModified = isValueModified(record);
        if (typeof record.value === "boolean") {
          return (
            <Select
              defaultValue={record.value}
              style={{ width: "100%" }}
              className={`${styles["borderless-select"]} ${isModified ? styles["modified-value"] : ""}`}
              size="small"
              options={[
                { value: true, label: "true" },
                { value: false, label: "false" },
              ]}
              onChange={(value) => {
                handleValueChange(record.key, value);
              }}
            ></Select>
          );
        } else {
          return (
            <Input
              defaultValue={record.originalValue}
              size="small"
              className={`${styles["borderless-input"]} ${isModified ? styles["modified-value"] : ""}`}
              onChange={(e: any) => {
                handleValueChange(record.key, e.target.value);
              }}
            ></Input>
          );
        }
      },
    },
  ];

  const [searchText, setSearchText] = useState("");

  // 过滤数据的逻辑
  const filteredData = useMemo(() => {
    if (!searchText) {
      return tableData;
    }

    return tableData.filter((item) =>
      item.variable.toLowerCase().includes(searchText.toLowerCase())
    );
  }, [searchText, tableData]);

  // 搜索处理函数
  const handleSearch = (value: string) => {
    setSearchText(value);
  };

  const handleRowClick = (record: TableDataItem) => {
    setSelectedRowKeys([record.rowKey]); // 单选逻辑
  };

  const handleContainerClick = useCallback((event: React.MouseEvent) => {
    // 检查点击是否在表格行上
    const target = event.target as HTMLElement;
    const isRowClick = target.closest(".ant-table-row");

    // 如果不是点击行，则取消选中
    if (!isRowClick) {
      setSelectedRowKeys([]);
    }
  }, []);

  const handleOk = () => {
    window.close();
  };

  const handleApply = () => {
    const modifiedRes = getModifiedData();
    modifiedRes.forEach((item) => {
      const cmd = `set_sta_config ${item.variable} ${item.value}`;
      // todo: 筛选新增cmd
      terminalModel.send(cmd);
    });
  };

  return (
    <div className={styles["application-container"]}>
      <div className={styles["variables-container"]}>
        <Search
          placeholder="Filter by Name"
          allowClear
          onSearch={handleSearch}
          onChange={(e) => setSearchText(e.target.value)}
          size="small"
        ></Search>
        <div
          className={styles["variables-list"]}
          onClick={handleContainerClick}
        >
          <Table
            columns={columns}
            dataSource={filteredData}
            pagination={false}
            sticky
            tableLayout="fixed"
            rowKey={"rowKey"}
            rowSelection={{
              selectedRowKeys: selectedRowKeys,
              hideSelectAll: true,
              columnWidth: 0,
              renderCell: () => null,
            }}
            onRow={(record) => ({
              onClick: () => handleRowClick(record),
            })}
          ></Table>
        </div>
      </div>

      <div className={styles["footer-btns"]}>
        <Button
          className={styles["btn-style"]}
          disabled={!hasModifications}
          onClick={handleOk}
        >
          OK
        </Button>
        <Button className={styles["cancel-btn"]}>Cancel</Button>
        <Button
          className={styles["btn-style"]}
          disabled={!hasModifications}
          onClick={handleApply}
        >
          Apply
        </Button>
      </div>
    </div>
  );
};

export default ApplicationPage;
