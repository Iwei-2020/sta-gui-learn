import reloadView from "@/assets/Icon/reloadView.png";
import zoomIn from "@/assets/Icon/zoomIn.png";
import zoomOut from "@/assets/Icon/zoomOut.png";
import zoomToFullWindow from "@/assets/Icon/zoomToFullWindow.png";
import Gaia from "@/components/GaiaClient/index";
import {
  TileMapEventInfo,
  TileMapProps,
} from "@/components/GaiaClient/interface";
import { flexLayoutManager, hierarchyModel } from "@/mobx";
import { schematicZoomStore } from "@/mobx/SchematicZoomStore";
import { tabStore } from "@/mobx/TabStore";
import openTooltip from "@/utils/openTooltip";
import { LoadingOutlined } from "@ant-design/icons";
import { Button, Spin, Tooltip } from "antd";
import { throttle } from "lodash";
import { observer } from "mobx-react";
import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./index.less";
import pinSource from "@/assets/Icon/pinSource.png";

interface SchematicProps {
  gaiaId: string;
  winName: string;
  summaryId: number;
  pathIdList: number[];
}

const SchematicPage: React.FC<SchematicProps> = observer((props) => {
  const GaiaComponent = Gaia as React.FC<TileMapProps>;
  const ref = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);

  const { gaiaId, winName, summaryId, pathIdList } = props;
  const isValid = flexLayoutManager.isTabValid(winName);
  const isDisabled = !isValid;
  const levelRef = useRef<number>(1);

  const data = tabStore.gaiaRenderDataMap.get(gaiaId) || [];

  // 容器长宽变化后更改schematic的对应长宽
  useEffect(() => {
    if (!ref.current) return;
    const resizeObserver = new ResizeObserver(() => {
      const width = ref.current?.clientWidth ?? 0;
      const height = ref.current?.clientHeight ?? 0;
      // 内部schematic部分的宽高，且确保其不小于0
      if (width > 0 && height > 0) {
        setWidth(width);
        setHeight(height - 36);
      }
    });
    resizeObserver.observe(ref.current);
    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  useEffect(() => {
    // 存储gaiaId和当前的level
    tabStore.setGaiaLevel(gaiaId.toString(), levelRef.current);
  }, [levelRef.current]);

  const prevIndexListRef = useRef<number[]>([]);
  const prevLevelRef = useRef<number>(-1);

  // 请求锁
  const isRenderingReq = useRef(false);
  const isClickingReq = useRef(false);

  const fetchRenderData = async (
    level: number,
    indexList: number[],
    refresh: boolean
  ) => {
    try {
      const res = await window.electronAPI.request({
        type: "schematic:render",
        winName,
        summaryId,
        pathIdList,
        level,
        gaiaId,
        indexList,
        isSingleCore: false, // 多核并行渲染
        refresh: refresh,
      });

      if (res.code === 0 && res.data && Array.isArray(res.data)) {
        const formattedData = res.data.map(
          (item: { index: number; blockBase64Str: string }) => ({
            index: item.index,
            blockBase64Str: item.blockBase64Str,
          })
        );
        tabStore.setGaiaRenderData(gaiaId, formattedData);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const [highlightReq, setHighlightReq] = useState<boolean>(false);

  useEffect(() => {
    // 初始渲染
    const initialLevel = 1;
    const initialIndexList = [0, 1, 2, 3];
    fetchRenderData(initialLevel, initialIndexList, true).finally(() => {
      setHighlightReq(true);
    });
  }, []);

  const fetchOperateData = async (
    level: number,
    clientX: number,
    clientY: number
  ) => {
    try {
      const updateRes = await window.electronAPI.request({
        type: "schematic:operate",
        operateType: "click",
        level,
        gaiaId,
        clientX,
        clientY,
      });

      if (
        updateRes.code === 0 &&
        updateRes.data &&
        Array.isArray(updateRes.data.imagesData)
      ) {
        const formattedUpdateData = updateRes.data.imagesData.map(
          (item: { index: number; blockBase64Str: string }) => ({
            index: item.index,
            blockBase64Str: item.blockBase64Str,
          })
        );
        tabStore.setGaiaRenderData(gaiaId, formattedUpdateData);
        hierarchyModel.updateLeafSelected({
          handle_name: updateRes.data.cellName,
          name: updateRes.data.cellName,
        });
      }
    } catch (error) {
      console.log("Error in operatoring:", error);
    }
  };

  // 节流
  const handleClick = throttle(async (event: TileMapEventInfo) => {
    if (isClickingReq.current) return;
    isClickingReq.current = true;

    const level = event.curLevel;
    const clientX = event.mouseInfo?.coordinateInTile.x as number;
    const clientY = event.mouseInfo?.coordinateInTile.y as number;

    levelRef.current = level;

    await fetchOperateData(level, clientX, clientY);

    isClickingReq.current = false;
  }, 300);

  const onDragMove = throttle(async (event: TileMapEventInfo) => {
    const level = event.curLevel;
    const indexList = event.visibleIndexList;

    levelRef.current = level;

    if (prevLevelRef.current !== level) {
      prevLevelRef.current = level;
      prevIndexListRef.current = [];
    }

    const prevIndexList = prevIndexListRef.current;
    const newIndexList = indexList.filter(
      (index) => !prevIndexList.includes(index)
    );

    if (newIndexList.length === 0) {
      return;
    }
    prevIndexListRef.current = indexList;

    isRenderingReq.current = true;
    fetchRenderData(level, newIndexList, false).finally(() => {
      isRenderingReq.current = false;
    });
  }, 300);

  const handleFrameSelect = async (event: TileMapEventInfo) => {
    // 处理框选
    const startX = event.framePosition?.start?.x ?? 0;
    const endX = event.framePosition?.end?.x ?? 0;
    const startY = event.framePosition?.start?.y ?? 0;
    const endY = event.framePosition?.end?.y ?? 0;

    const xMin = Math.min(startX, endX);
    const xMax = Math.max(startX, endX);
    const yMin = Math.min(startY, endY);
    const yMax = Math.max(startY, endY);

    try {
      const res = await window.electronAPI.request({
        type: "schematic:operate",
        operateType: "frameSelected",
        gaiaId,
        level: event.curLevel,
        xMin,
        xMax,
        yMin,
        yMax,
      });

      if (res.code === 0 && res.data && Array.isArray(res.data)) {
        const formattedUpdateData = res.data.map(
          (item: { index: number; blockBase64Str: string }) => ({
            index: item.index,
            blockBase64Str: item.blockBase64Str,
          })
        );
        tabStore.setGaiaRenderData(gaiaId, formattedUpdateData);
      }
    } catch (error) {
      openTooltip("error", error as string);
    }
  };

  const handleWheel = throttle(async (event: TileMapEventInfo) => {
    const level = event.curLevel;
    const indexList = event.visibleIndexList as number[];

    levelRef.current = level;

    if (prevLevelRef.current !== level) {
      prevLevelRef.current = level;
      prevIndexListRef.current = [];
    }

    const prevIndexList = prevIndexListRef.current;
    const newIndexList = indexList.filter(
      (index) => !prevIndexList.includes(index)
    );

    if (newIndexList.length === 0) {
      return;
    }

    prevIndexListRef.current = indexList;

    isRenderingReq.current = true;
    fetchRenderData(level, newIndexList, false).finally(() => {
      isRenderingReq.current = false;
    });
  }, 300);

  const handleRightClick = () => {};

  const fetchDoubleClickData = async (
    level: number,
    clientX: number,
    clientY: number
  ) => {
    try {
      const doubleClickRes = await window.electronAPI.request({
        type: "schematic:operate",
        operateType: "dclick",
        level,
        gaiaId,
        clientX,
        clientY,
      });

      if (
        doubleClickRes.code === 0 &&
        doubleClickRes.data &&
        Array.isArray(doubleClickRes.data)
      ) {
        const formattedUpdateData = doubleClickRes.data.map(
          (item: { index: number; blockBase64Str: string }) => ({
            index: item.index,
            blockBase64Str: item.blockBase64Str,
          })
        );
        tabStore.setGaiaRenderData(gaiaId, formattedUpdateData);
      }
    } catch (error) {
      openTooltip("error", error as string);
    }
  };

  const handleDoubleClick = throttle(async (event: TileMapEventInfo) => {
    if (isClickingReq.current) return;
    isClickingReq.current = true;

    const level = event.curLevel;
    const clientX = event.mouseInfo?.coordinateInTile.x as number;
    const clientY = event.mouseInfo?.coordinateInTile.y as number;

    levelRef.current = level;

    await fetchDoubleClickData(level, clientX, clientY);

    isClickingReq.current = false;
  }, 300);

  const forceLoad = schematicZoomStore.forceLoadFlag;

  const handleFullWin = () => {
    schematicZoomStore.zoomReset(gaiaId);
  };

  const reLoad = () => {
    // 刷新重绘
    schematicZoomStore.zoomReset(gaiaId);
    fetchRenderData(1, [0, 1, 2, 3], true);
  };

  const selectedInstance = useMemo(() => {
    return (
      hierarchyModel.leafSelected?.handle_name ??
      hierarchyModel.hierarchySelected?.handle_name
    );
  }, [hierarchyModel.leafSelected, hierarchyModel.hierarchySelected]);

  useEffect(() => {
    const fetchHighlightElement = async (level: number, handleName: string) => {
      try {
        const updateRes = await window.electronAPI.request({
          type: "schematic:operate",
          operateType: "highlight",
          level,
          gaiaId,
          name: handleName,
        });

        if (updateRes.code === 0 && updateRes.data) {
          tabStore.setGaiaRenderData(gaiaId, updateRes.data);
        }
      } catch (error) {
        console.log("Error in highlight element:", error);
      }
    };
    if (!gaiaId || !selectedInstance || !highlightReq) return;

    fetchHighlightElement(levelRef.current, selectedInstance);
  }, [selectedInstance, gaiaId]);

  const switchTab = () => {
    if (isValid) {
      flexLayoutManager.switchToTab(winName);
    }
  };

  return (
    <div ref={ref} className={styles.container}>
      <div className={styles["schematic-menu"]}>
        <Button
          className={styles["summary-btn"]}
          onClick={switchTab}
          disabled={isDisabled}
        >
          {winName}
          <img src={pinSource} className={styles["btn-icon"]} />
        </Button>
        <Tooltip title="Zoom In" placement="top" autoAdjustOverflow={false}>
          <div className={styles["menu-item"]}>
            <img
              src={zoomIn}
              className={styles["menu-icon"]}
              onClick={() => {
                schematicZoomStore.zoomIn(gaiaId);
              }}
            />
          </div>
        </Tooltip>
        <Tooltip title="Zoom Out" autoAdjustOverflow={false}>
          <div className={styles["menu-item"]}>
            <img
              src={zoomOut}
              className={styles["menu-icon"]}
              onClick={() => {
                schematicZoomStore.zoomOut(gaiaId);
              }}
            />
          </div>
        </Tooltip>
        <Tooltip title="Zoom to Full Window" autoAdjustOverflow={false}>
          <div className={styles["menu-item"]}>
            <img
              src={zoomToFullWindow}
              className={styles["menu-icon"]}
              onClick={() => {
                handleFullWin();
              }}
            />
          </div>
        </Tooltip>
        <Tooltip title="Reload View" autoAdjustOverflow={false}>
          <div className={styles["menu-item"]}>
            <img
              src={reloadView}
              className={styles["menu-icon"]}
              onClick={() => reLoad()}
            />
          </div>
        </Tooltip>
      </div>
      <div className={styles["gaia-container"]}>
        {data.length ? (
          <>
            <GaiaComponent
              enableCache={true}
              tileData={data}
              onDragMove={onDragMove}
              onFrameSelect={handleFrameSelect}
              onClick={handleClick}
              onWheel={handleWheel}
              onRightClick={handleRightClick}
              onDoubleClick={handleDoubleClick}
              scale={schematicZoomStore.getScale(gaiaId)}
              forceLoad={forceLoad}
              tileConfig={{
                tileSwitchLevel: 4,
                tilesNumPerResolution: [
                  { x: 2, y: 2 },
                  { x: 8, y: 8 },
                  { x: 32, y: 32 },
                ],
              }}
              canvasSize={{ width: width, height: height }}
            />
            {/* {menuVisible && (
              <div
                style={{
                  position: "fixed",
                  top: menuPosition.y,
                  left: menuPosition.x,
                  zIndex: 9999,
                }}
              >
                <Dropdown
                  menu={{ items: menuItems, onClick: handleMenuClick }}
                  open
                >
                  <div />
                </Dropdown>
              </div>
            )} */}
          </>
        ) : (
          <Spin
            indicator={<LoadingOutlined style={{ fontSize: 24 }} spin />}
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "100%",
            }}
          />
        )}
      </div>
    </div>
  );
});

export default SchematicPage;
