import { Table, Typography } from "antd";
import styles from "./index.less";
import { IGenerateReportProps, ITableType } from "./interface";
import FullSizeKeep from "../FullSizeKeep";
import { getStrDisplayWidth } from "@/utils/getStrDisplayWidth";
import { showContextMenu } from "../ContextMenu";

const GenerateReportTable = <D extends ITableType = ITableType>(
  props: IGenerateReportProps<D>
) => {
  const { columns, dataSource, contextEvent, ...restProps } = props;

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
          <div className={styles["table-container"]}>
            <Table<D>
              columns={finalColumn}
              dataSource={dataSource}
              size="small"
              pagination={false}
              rowKey={"rowKey"}
              sticky
              tableLayout="fixed"
              style={{ height: "100%" }}
              onRow={(record) => {
                return {
                  onContextMenu: (event) => {
                    event.preventDefault();

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
                };
              }}
            />
          </div>
        );
      }}
    </FullSizeKeep>
  );
};

export default GenerateReportTable;
