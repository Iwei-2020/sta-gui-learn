import { getStrDisplayWidth } from "@/utils/getStrDisplayWidth";
import { ConfigProvider, Table, Typography } from "antd";
import {
  ForwardedRef,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from "react";
import { showContextMenu } from "../ContextMenu";
import FullSizeKeep from "../FullSizeKeep";
import styles from "./index.less";
import { IDataType, IThorTableProps } from "./interface";

const ThorTable = <D extends IDataType = IDataType>(
  props: IThorTableProps<D>,
  ref: ForwardedRef<{ setSelectedKeys: (v: string[]) => void }>
) => {
  const {
    columns: _columns,
    dataSource,
    handleSelect,
    autoWidth = false,
    contextEvent,
    selectionMode = "single",
    ...restProps
  } = props;
  const [selectedKeys, setSelectedKeys] = useState<Array<string>>([]);

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

  const lastClickedIndexRef = useRef<number | null>(null); // 记录上次点击索引

  const handleRowClick = (record: D, event: React.MouseEvent) => {
    const rowKey = record.rowKey;
    const clickedIndex = dataSource.findIndex((item) => item.rowKey === rowKey);

    setSelectedKeys((prevSelectedKeys) => {
      let newSelectedKeys = [...prevSelectedKeys];

      if (selectionMode === "single") {
        // 单选模式：仅支持单选
        newSelectedKeys = [rowKey];
      } else if (selectionMode === "multi") {
        // 多选模式: 支持单选+多选
        if (event.shiftKey && lastClickedIndexRef.current !== null) {
          // Shift+单击: 区间选择
          const lastIndex = lastClickedIndexRef.current;
          const [start, end] = [
            Math.min(lastIndex, clickedIndex),
            Math.max(lastIndex, clickedIndex),
          ];
          const rangeKeys = dataSource
            .slice(start, end + 1)
            .map((item) => item.rowKey);
          newSelectedKeys = Array.from(
            new Set([...newSelectedKeys, ...rangeKeys])
          );
        } else if (event.ctrlKey) {
          // Ctrl+单击: 多选
          if (newSelectedKeys.includes(rowKey)) {
            newSelectedKeys = newSelectedKeys.filter((key) => key !== rowKey);
          } else {
            newSelectedKeys.push(rowKey);
          }
          lastClickedIndexRef.current = clickedIndex;
        } else {
          // 单选
          newSelectedKeys = [rowKey];
          lastClickedIndexRef.current = clickedIndex;
        }
      }

      const selectedItems = dataSource.filter((item) =>
        newSelectedKeys.includes(item.rowKey)
      );

      handleSelect?.(selectedItems);

      return newSelectedKeys;
    });
  };

  // 框选相关
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number } | null>(null);
  const dragEndRef = useRef<{ x: number; y: number } | null>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);
  const handleMouseDown = (e: React.MouseEvent) => {
    // 只在多选模式下启用框选
    if (selectionMode !== "multi") {
      return;
    }

    if (e.button !== 0) return; // 只响应左键
    if (e.ctrlKey || e.shiftKey) return; // 按住 ctrl/shift 时不启用框选

    isDraggingRef.current = false;
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    dragEndRef.current = { x: e.clientX, y: e.clientY };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
  };

  const [dragRect, setDragRect] = useState<{
    top: number;
    left: number;
    width: number;
    height: number;
  } | null>(null);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragStartRef.current) return;

    const currentPos = { x: e.clientX, y: e.clientY };
    setDragRect({
      top: Math.min(dragStartRef.current.y, currentPos.y),
      left: Math.min(dragStartRef.current.x, currentPos.x),
      width: Math.abs(currentPos.x - dragStartRef.current.x),
      height: Math.abs(currentPos.y - dragStartRef.current.y),
    });

    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 5) {
      isDraggingRef.current = true;
    }

    if (isDraggingRef.current) {
      dragEndRef.current = { x: e.clientX, y: e.clientY };
    }
  }, []);

  const dragEndingRef = useRef(false);

  const handleMouseUp = useCallback(() => {
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);

    if (isDraggingRef.current && dragStartRef.current && dragEndRef.current) {
      performRangeSelection();
    }

    dragStartRef.current = null;
    dragEndRef.current = null;
    isDraggingRef.current = false;

    setDragRect(null);

    // 标记拖拽刚刚结束
    dragEndingRef.current = true;
    requestAnimationFrame(() => {
      dragEndingRef.current = false;
    });
  }, [dataSource]); // 依赖 dataSource

  const performRangeSelection = () => {
    if (!dragStartRef.current || !dragEndRef.current) return;

    const startX = Math.min(dragStartRef.current.x, dragEndRef.current.x);
    const endX = Math.max(dragStartRef.current.x, dragEndRef.current.x);
    const startY = Math.min(dragStartRef.current.y, dragEndRef.current.y);
    const endY = Math.max(dragStartRef.current.y, dragEndRef.current.y);

    const rows = tableContainerRef.current?.querySelectorAll(
      ".ant-table-tbody > tr"
    );
    if (!rows) return;

    const rangeKeys: string[] = [];
    rows.forEach((row) => {
      const rect = row.getBoundingClientRect();
      const rowCenterX = rect.left + rect.width / 2;
      const rowCenterY = rect.top + rect.height / 2;

      if (
        rowCenterX >= startX &&
        rowCenterX <= endX &&
        rowCenterY >= startY &&
        rowCenterY <= endY
      ) {
        const rowKey = row.getAttribute("data-row-key");
        if (rowKey) rangeKeys.push(rowKey);
      }
    });

    if (rangeKeys.length > 0) {
      setSelectedKeys(rangeKeys); // 框选直接替换选择
      const selectedItems = dataSource.filter((item) =>
        rangeKeys.includes(item.rowKey)
      );

      handleSelect?.(selectedItems);
    }
  };

  useEffect(() => {
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  useEffect(() => {
    setSelectedKeys([]);
  }, [dataSource]);

  // todo
  const emptyContent = () => <div></div>;

  return (
    <FullSizeKeep {...restProps}>
      {(width) => {
        const finalColumn = columns.map((column: any) => {
          if (
            typeof column.width === "number" &&
            column.width > (width * 3) / 4
          ) {
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
            };
          } else {
            return column;
          }
        });
        return (
          <div
            className={styles["table-container"]}
            ref={tableContainerRef}
            onClick={(event) => {
              if (dragEndingRef.current) {
                return;
              }
              // 判断点击的是否是表格某一行
              const clickedRow = (event.target as HTMLElement).closest("tr");
              // 如果不是，取消选中状态
              if (!clickedRow) {
                setSelectedKeys([]);
              }
            }}
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
                    onContextMenu: (event) => {
                      event.preventDefault();

                      if (selectionMode === "multi") {
                        const rowKey = record.rowKey;
                        const isAlreadySelected = selectedKeys.includes(rowKey);

                        if (
                          !isAlreadySelected &&
                          !event.ctrlKey &&
                          !event.shiftKey
                        ) {
                          handleRowClick(record, event);
                        }
                      } else {
                        handleRowClick(record, event);
                      }

                      if (contextEvent?.menu && contextEvent?.onMenuItemClick) {
                        showContextMenu({
                          position: {
                            x: event.clientX,
                            y: event.clientY,
                          },
                          menu: Array.isArray(contextEvent.menu)
                            ? contextEvent.menu
                            : contextEvent.menu(record, event),
                          onMenuItemClick: contextEvent?.onMenuItemClick(
                            record,
                            event
                          ),
                        });
                      }
                    },
                    onMouseDown: handleMouseDown,
                  };
                }}
                style={{ height: "100%" }}
              />
            </ConfigProvider>
            {dragRect && (
              <div
                style={{
                  position: "fixed", // 使用 fixed 相对于视口，避免父元素定位影响
                  top: dragRect.top,
                  left: dragRect.left,
                  width: dragRect.width,
                  height: dragRect.height,
                  border: "1px dashed #ffffff", // 使用主题色，更明显
                  pointerEvents: "none",
                  zIndex: 9999, // 确保在最上层
                }}
              />
            )}
          </div>
        );
      }}
    </FullSizeKeep>
  );
};
export default forwardRef(ThorTable);
