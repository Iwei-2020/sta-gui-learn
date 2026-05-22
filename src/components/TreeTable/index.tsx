import { getStrDisplayWidth } from "@/utils/getStrDisplayWidth";
import { ConfigProvider, Table, Typography } from "antd";
import React, {
  ForwardedRef,
  forwardRef,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { showContextMenu } from "../ContextMenu";
import FullSizeKeep from "../FullSizeKeep";
import styles from "./index.less";
import { IDataType, ITreeTableProps } from "./interface";

const TreeTable = <D extends IDataType = IDataType>(
  props: ITreeTableProps<D>,
  ref: ForwardedRef<{ setSelectedKeys: (v: string[]) => void }>
) => {
  const {
    columns: _columns,
    dataSource,
    handleSelect,
    autoWidth = false,
    contextEvent,
    ...restProps
  } = props;
  const [selectedKeys, setSelectedKeys] = useState<Array<string>>([]);

  const tableContainerRef = useRef<HTMLDivElement>(null); // 表格容器的ref，用于定位虚线框'

  useImperativeHandle(ref, () => ({
    setSelectedKeys,
    getSelectedItems: () =>
      dataSource.filter((item) => selectedKeys.includes(item.rowKey)),
  }));

  const columns = useMemo(() => {
    const finalColumns = [..._columns];
    for (let column of finalColumns) {
      const { title, key } = column;
      if (title && typeof key === "string") {
        const maxWidth = Math.max(
          ...dataSource.map((item) => getStrDisplayWidth(item[key], 14))
        );
        if (autoWidth) {
          column.width =
            Math.max(maxWidth, getStrDisplayWidth(title.toString(), 14)) +
            8 * 2;
        }
      }
    }
    return finalColumns;
  }, [_columns, dataSource]);

  const handleRowClick = (record: D, event: React.MouseEvent) => {
    const rowKey = record.rowKey;

    const newSelectedKeys = [rowKey];
    setSelectedKeys(newSelectedKeys);

    const selectedItems = dataSource.filter((item) =>
      newSelectedKeys.includes(item.rowKey)
    );

    handleSelect?.(selectedItems);

    return newSelectedKeys;
  };

  useEffect(() => {
    setSelectedKeys([]);
  }, [dataSource]);

  const [selectedCells, setSelectedCells] = useState<Set<string>>(new Set()); // 存储选中的单元格（格式："row-col"）

  const handleCellClick = (rowIndex: number, columnIndex: number) => {
    const cellKey = `${rowIndex}-${columnIndex}`;
    const record = dataSource[rowIndex];
    if (!record) return;
    // 如果点击的是已选中的单元格，清空选中
    if (selectedCells.has(cellKey)) {
      setSelectedCells(new Set());
      setSelectedKeys([]);
      handleSelect?.([]);
    }
    // 否则选中这个单元格
    else {
      setSelectedCells(new Set([cellKey]));
      setSelectedKeys([record.rowKey]);
      handleSelect?.([record]);
    }
  };

  // todo
  const emptyContent = () => <div></div>;

  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(
    null
  );
  const [currentPos, setCurrentPos] = useState<{ x: number; y: number } | null>(
    null
  );
  const isDraggingRef = useRef(false);

  // 鼠标按下：开始拖拽
  const handleMouseDown = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (event.button !== 0) return; // 只响应左键
    if (event.ctrlKey || event.shiftKey) return;
    const container = tableContainerRef.current;
    if (!container) return;

    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left; // 相对于表格容器的X坐标
    const y = event.clientY - rect.top; // 相对于表格容器的Y坐标
    setDragStart({ x, y });
    setCurrentPos({ x, y });
    isDraggingRef.current = false; // 初始不是拖拽
  };

  // 鼠标移动：更新虚线框和选中单元格
  const handleMouseMove = (event: React.MouseEvent) => {
    event.stopPropagation();
    if (!dragStart || !tableContainerRef.current) return;

    const container = tableContainerRef.current;
    const rect = container.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    setCurrentPos({ x, y });

    // 计算移动距离
    const dx = x - dragStart.x;
    const dy = y - dragStart.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 5) {
      isDraggingRef.current = true; // 进入拖拽
    }

    if (!isDraggingRef.current) return;
  };

  const handleMouseUp = () => {
    if (!dragStart || !currentPos || !tableContainerRef.current) {
      isDraggingRef.current = false;
      setDragStart(null);
      setCurrentPos(null);
      return;
    }

    const container = tableContainerRef.current;
    const rect = container.getBoundingClientRect();

    // 计算选区矩形（相对于容器）
    const left = Math.min(dragStart.x, currentPos.x);
    const top = Math.min(dragStart.y, currentPos.y);
    const right = Math.max(dragStart.x, currentPos.x);
    const bottom = Math.max(dragStart.y, currentPos.y);

    // 遍历所有数据行
    const rows = container.querySelectorAll("tbody tr.ant-table-row");
    const newlySelected = new Set<string>();

    rows.forEach((row, rowIndex) => {
      const cells = row.querySelectorAll(
        "td.ant-table-cell:not(.ant-table-selection-column):not(.ant-table-expand-icon-cell)"
      );
      cells.forEach((cell, colIndex) => {
        const cellRect = cell.getBoundingClientRect();
        const cellLeft = cellRect.left - rect.left;
        const cellTop = cellRect.top - rect.top;
        const cellRight = cellLeft + cellRect.width;
        const cellBottom = cellTop + cellRect.height;

        // 判断相交
        const isIntersect = !(
          cellRight < left ||
          cellLeft > right ||
          cellBottom < top ||
          cellTop > bottom
        );

        if (isIntersect) {
          const key = `${rowIndex}-${colIndex}`;
          newlySelected.add(key);
        }
      });
    });

    // 更新选中状态
    setSelectedCells(newlySelected);

    // 清理拖拽状态
    isDraggingRef.current = false;
    setDragStart(null);
    setCurrentPos(null);
  };

  const renderTable = (width: number) => {
    const finalColumn = columns.map((column: any, columnIndex: number) => {
      const getOnCell = (record: any, rowIndex: number) => ({
        onClick: () => {
          if (!isDraggingRef.current) {
            handleCellClick(rowIndex, columnIndex);
          }
        },
        onContextMenu: (event: any) => {
          event.preventDefault();
          handleCellClick(rowIndex, columnIndex);
          handleRowClick(record, event);

          if (contextEvent?.menu && contextEvent?.onMenuItemClick) {
            showContextMenu({
              position: { x: event.clientX, y: event.clientY },
              menu: Array.isArray(contextEvent.menu)
                ? contextEvent.menu
                : contextEvent.menu(record, event),
              onMenuItemClick: contextEvent?.onMenuItemClick(record, event),
            });
          }
        },
        onMouseDown: (event: React.MouseEvent) => {
          handleMouseDown(event);
        },
        onMouseMove: (event: React.MouseEvent) => {
          handleMouseMove(event);
        },
        onMouseUp: (event: React.MouseEvent) => {
          event.stopPropagation();
          handleMouseUp();
        },

        className: `${selectedCells.has(`${rowIndex}-${columnIndex}`) ? "cell-selected-dom" : ""}`,
      });
      if (typeof column.width === "number" && column.width > (width * 3) / 4) {
        return {
          ...column,
          width: Math.max(
            (width * 3) / 4,
            getStrDisplayWidth(column.title!.toString(), 14)
          ),
          render(value: string) {
            return (
              <Typography.Text
                ellipsis
                style={{ color: "inherit" }}
                title={value}
              >
                {value}
              </Typography.Text>
            );
          },
          onCell: getOnCell,
        };
      } else {
        return {
          ...column,
          onCell: getOnCell,
        };
      }
    });

    const getDragRect = () => {
      if (!dragStart || !currentPos) return null;

      return {
        top: Math.min(dragStart.y, currentPos.y),
        left: Math.min(dragStart.x, currentPos.x),
        width: Math.abs(currentPos.x - dragStart.x),
        height: Math.abs(currentPos.y - dragStart.y),
      };
    };
    return (
      <div
        ref={tableContainerRef}
        className={styles["table-container"]}
        onClick={(event) => {
          // 判断点击的是否是表格某一行
          const clickedRow = (event.target as HTMLElement).closest("tr");
          // 如果不是，取消选中状态
          if (!clickedRow) {
            setSelectedKeys([]);
          }
        }}
        onMouseUp={() => {
          handleMouseUp(); // 确保鼠标在表格外松开时也能结束拖拽
        }}
        style={{ position: "relative" }} // 为虚线框的绝对定位提供基准
      >
        <ConfigProvider renderEmpty={emptyContent}>
          <Table<D>
            columns={finalColumn}
            dataSource={dataSource}
            size="small"
            pagination={false}
            rowKey={"rowKey"}
            sticky
            tableLayout="fixed"
            rowSelection={{
              selectedRowKeys: selectedKeys,
              columnWidth: 0,
              hideSelectAll: true,
              renderCell: () => null,
            }}
            onRow={(record) => {
              return {
                onClick: (event) => {
                  handleRowClick(record, event);
                },
              };
            }}
            style={{ height: "100%" }}
          />
        </ConfigProvider>
        {getDragRect() && (
          <div
            style={{
              position: "absolute",
              top: `${getDragRect()!.top}px`,
              left: `${getDragRect()!.left}px`,
              width: `${getDragRect()!.width}px`,
              height: `${getDragRect()!.height}px`,
              border: "1px dashed #ffffff", // 虚线样式
              pointerEvents: "none", // 不影响交互
              zIndex: 10, // 确保在表格上层
            }}
          />
        )}
      </div>
    );
  };

  return (
    <FullSizeKeep {...restProps}>
      {(width) => {
        return renderTable(width);
      }}
    </FullSizeKeep>
  );
};
export default forwardRef(TreeTable);
