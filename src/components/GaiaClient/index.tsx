import React, {
  memo,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import calculateVisibleTiles from "./utils/calculateVisibleTiles";
import tilesTransform from "./utils/tilesTransform";
import useGaiaInit from "./hooks/useGaiaInit";
import useTileImageCache from "./hooks/useTileImageCache";
import { EventType, TileMapEventInfo, TileMapProps } from "./interface";

const Gaia: React.FC<TileMapProps> = ({
  enableCache = false,
  tileData,
  onClick: handleClickCallback,
  onWheel: handleWheelCallback,
  onRightClick: handleRightClickCallback,
  onDoubleClick: handleDoubleClickCallback,
  onDragMove,
  onFrameSelect,
  canvasSize = {
    width: 200,
    height: 200,
  },
  tileConfig,
  scale = 1,
  forceLoad = false,
}) => {
  const [renderFlag, setRenderFlag] = useState<boolean>(true);
  const { tileSwitchLevel = 1, tilesNumPerResolution } = tileConfig;
  const [curResolution, setCurResolution] = useState<number>(0);
  const canvasRef = useRef<null | HTMLCanvasElement>(null);
  const viewport = useRef({
    x: 0,
    y: 0,
  });
  const isDragging = useRef<boolean>(false);
  const clickTimer = useRef<NodeJS.Timeout | null>(null);
  const dragMoveTimer = useRef<NodeJS.Timeout | null>(null);
  const wheelTimer = useRef<NodeJS.Timeout | null>(null);
  const zoomLevel = useRef(1);
  // 存储上一次的鼠标位置
  const lastPosition = useRef<{ x: number; y: number }>({ x: 0, y: 0 });
  const resolutionNumber = useMemo(() => {
    return tilesNumPerResolution instanceof Array
      ? tilesNumPerResolution.length
      : 1;
  }, []);

  const {
    updateData,
    tileWidth,
    tileHeight,
    tilesX,
    tilesY,
    setTilesX,
    setTilesY,
  } = useGaiaInit(
    tileData,
    viewport,
    tilesNumPerResolution,
    canvasSize,
    canvasRef
  );

  const canvas = canvasRef.current;
  const context = canvas?.getContext("2d");

  const { imgCache } = useTileImageCache(
    enableCache,
    tileSwitchLevel,
    curResolution,
    resolutionNumber,
    tilesX * tilesY,
    zoomLevel,
    updateData,
    tilesNumPerResolution,
    setCurResolution,
    setTilesX,
    setTilesY
  );

  // 初次渲染时调整比例
  const prevScaleRef = useRef(scale);
  const prevForceLoadRef = useRef<boolean>(forceLoad);
  const isInitialRender = useRef(true);
  const prevCanvasSize = useRef(canvasSize);

  useEffect(() => {
    if (tileWidth > 0) {
      const totalTileWidth = tilesX * tileWidth;
      const totalTileHeight = tilesY * tileHeight;
      const canvasWidth = canvasSize.width;
      const canvasHeight = canvasSize.height;

      const scaleX = canvasWidth / totalTileWidth;
      const scaleY = canvasHeight / totalTileHeight;
      const scaleRatio = Math.min(scaleX, scaleY);

      const scaleChangeFactor = scale / prevScaleRef.current;
      prevScaleRef.current = scale;

      if (
        forceLoad !== prevForceLoadRef.current ||
        canvasSize.width !== prevCanvasSize.current.width ||
        canvasSize.height !== prevCanvasSize.current.height ||
        isInitialRender.current
      ) {
        // 初次渲染、canvasSize变化或强制刷新时
        zoomLevel.current = scaleRatio * scale;
        viewport.current = {
          x: (canvasWidth - totalTileWidth * zoomLevel.current) / 2,
          y: (canvasHeight - totalTileHeight * zoomLevel.current) / 2,
        };
        isInitialRender.current = false;
        prevForceLoadRef.current = forceLoad;
        prevCanvasSize.current = canvasSize;
      } else {
        const zoomRatio = scaleChangeFactor;
        zoomLevel.current *= zoomRatio;
        const centerX = canvasWidth / 2;
        const centerY = canvasHeight / 2;

        viewport.current.x =
          centerX - (centerX - viewport.current.x) * zoomRatio;
        viewport.current.y =
          centerY - (centerY - viewport.current.y) * zoomRatio;
      }

      // 切换层级时保证缩放连续性
      const visibleIndexList = calculateVisibleTiles(
        canvasSize,
        zoomLevel.current,
        viewport.current,
        tilesX,
        tilesY,
        tileWidth,
        tileHeight
      );

      let newResolution = curResolution;
      let transformedIndices = visibleIndexList;

      if (zoomLevel.current > tileSwitchLevel) {
        // 切换到更高分辨率
        newResolution = Math.min(resolutionNumber - 1, curResolution + 1);
        transformedIndices = Array.from(
          tilesTransform(
            visibleIndexList,
            true, // zoomIn
            tileSwitchLevel,
            tilesX
          )
        );
      } else if (zoomLevel.current < 1) {
        // 切换到更低分辨率
        newResolution = Math.max(0, curResolution - 1);
        transformedIndices = Array.from(
          tilesTransform(
            visibleIndexList,
            false, // zoomIn
            tileSwitchLevel,
            tilesX
          )
        );
      }
      // 否则保持当前分辨率
      const curLevel = newResolution + 1;

      handleWheelCallback?.({
        zoomLevel: zoomLevel.current,
        viewPort: viewport.current,
        type: EventType.Wheel,
        visibleIndexList: transformedIndices,
        curLevel: curLevel,
      });

      setRenderFlag((prev) => !prev);
    }
  }, [canvasSize.width, canvasSize.height, scale, forceLoad, tileWidth]);

  // 依据顺序绘制瓦片图
  const drawTiles = (context: CanvasRenderingContext2D) => {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    imgCache?.forEach((item) => {
      const { x, y, img } = item;

      if (img.complete) {
        context.drawImage(
          img,
          x * zoomLevel.current + viewport.current.x,
          y * zoomLevel.current + viewport.current.y,
          tileWidth * zoomLevel.current,
          tileHeight * zoomLevel.current
        );
      } else {
        img.onload = () => {
          context.drawImage(
            img,
            x * zoomLevel.current + viewport.current.x,
            y * zoomLevel.current + viewport.current.y,
            tileWidth * zoomLevel.current,
            tileHeight * zoomLevel.current
          );
        };
      }
    });
  };

  // 绘图
  useLayoutEffect(() => {
    if (context) {
      drawTiles(context);
    }
  }, [renderFlag, imgCache]);

  const curResolutionRef = useRef(curResolution);

  // 监听 curResolution 变化，保持 ref 更新
  useEffect(() => {
    curResolutionRef.current = curResolution;
  }, [curResolution]);

  // 监听键盘空格键
  const isSpacePressedRef = useRef(false);
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        isSpacePressedRef.current = true;
      }
    };

    const handleKeyUp = (event: KeyboardEvent) => {
      if (event.code === "Space") {
        isSpacePressedRef.current = false;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  const selectionStart = useRef<{ x: number; y: number } | null>(null);
  const selectionEnd = useRef<{ x: number; y: number } | null>(null);

  const handleMouseDown: React.MouseEventHandler<HTMLCanvasElement> = (
    event
  ) => {
    const startX = event.clientX;
    const startY = event.clientY;
    if (!context) return;

    if (event.button === 0 && isSpacePressedRef.current) {
      // 拖拽: 鼠标左键+按住键盘空格键

      if (!canvas) return;
      // 设置光标样式
      canvas.style.cursor = "grabbing";

      // 初始化 lastPosition 存储的值
      lastPosition.current = { x: startX, y: startY };
      const onMouseMove = (moveEvent: MouseEvent) => {
        setRenderFlag((f) => !f);
        isDragging.current = true;
        const dx = moveEvent.clientX - lastPosition.current.x;
        const dy = moveEvent.clientY - lastPosition.current.y;

        viewport.current = {
          x: viewport.current.x + dx,
          y: viewport.current.y + dy,
        };

        lastPosition.current = { x: moveEvent.clientX, y: moveEvent.clientY };

        // 防止频繁触发
        if (!dragMoveTimer.current) {
          dragMoveTimer.current = setTimeout(() => {
            onDragMove?.({
              zoomLevel: zoomLevel.current,
              viewPort: { x: viewport.current.x, y: viewport.current.y },
              type: EventType.DragMove,
              visibleIndexList: calculateVisibleTiles(
                canvasSize,
                zoomLevel.current,
                viewport.current,
                tilesX,
                tilesY,
                tileWidth,
                tileHeight
              ),
              curLevel: curResolutionRef.current + 1,
            });
            dragMoveTimer.current = null;
          }, 100);
        }
      };

      const onMouseUp = () => {
        canvas?.removeEventListener("mousemove", onMouseMove);
        canvas?.removeEventListener("mouseup", onMouseUp);
        if (canvas) {
          canvas.style.cursor = "default";
        }
      };

      canvas?.addEventListener("mousemove", onMouseMove);
      canvas?.addEventListener("mouseup", onMouseUp);
    } else if (event.button === 0) {
      // 框选: 鼠标左键
      selectionStart.current = { x: startX, y: startY };
      const rect = canvasRef.current?.getBoundingClientRect() as DOMRect;

      const onMouseMove = (moveEvent: MouseEvent) => {
        isDragging.current = true;
        selectionEnd.current = {
          x: moveEvent.clientX,
          y: moveEvent.clientY,
        };

        if (!selectionStart.current || !selectionEnd.current) return;

        // 重绘 tiles
        drawTiles(context);

        const { x: startX, y: startY } = selectionStart.current;
        const { x: endX, y: endY } = selectionEnd.current;

        const frameX = Math.min(startX, endX) - rect.left;
        const frameY = Math.min(startY, endY) - rect.top;
        const width = Math.abs(endX - startX);
        const height = Math.abs(endY - startY);

        // 虚线框
        context.save();
        context.strokeStyle = "#7f7f7f";
        context.setLineDash([2, 2]);
        context.lineWidth = 2;
        context.strokeRect(frameX, frameY, width, height);
        context.restore();
      };

      const onMouseUp = () => {
        // 只在拖拽结束时触发一次
        if (selectionStart.current && selectionEnd.current) {
          onFrameSelect?.({
            zoomLevel: zoomLevel.current,
            viewPort: { x: viewport.current.x, y: viewport.current.y },
            type: EventType.DragMove,
            visibleIndexList: calculateVisibleTiles(
              canvasSize,
              zoomLevel.current,
              viewport.current,
              tilesX,
              tilesY,
              tileWidth,
              tileHeight
            ),
            curLevel: curResolutionRef.current + 1,
            framePosition: {
              start: {
                x:
                  (selectionStart.current.x - rect.left - viewport.current.x) /
                  zoomLevel.current,
                y:
                  (selectionStart.current.y - rect.top - viewport.current.y) /
                  zoomLevel.current,
              },
              end: {
                x:
                  (selectionEnd.current.x - rect.left - viewport.current.x) /
                  zoomLevel.current,
                y:
                  (selectionEnd.current.y - rect.top - viewport.current.y) /
                  zoomLevel.current,
              },
            },
          });
        }

        selectionStart.current = null;
        selectionEnd.current = null;

        canvas?.removeEventListener("mousemove", onMouseMove);
        canvas?.removeEventListener("mouseup", onMouseUp);
      };

      canvas?.addEventListener("mousemove", onMouseMove);
      canvas?.addEventListener("mouseup", onMouseUp);
    }
  };

  const handleWheel: React.WheelEventHandler<HTMLCanvasElement> = (event) => {
    setRenderFlag((f) => !f);

    if (!canvas) return;

    const zoomStep = 0.1;
    const zoomFactor = event.deltaY < 0 ? 1 + zoomStep : 1 - zoomStep;

    // 获取鼠标相对画布的位置
    const rect = canvas.getBoundingClientRect();
    const mouseX = event.clientX - rect.left;
    const mouseY = event.clientY - rect.top;

    // 根据鼠标位置计算新的 viewport，使得缩放在鼠标指针位置发生
    const newZoomLevel = Math.max(
      0.1, // 最小缩放比例
      Math.min(100, zoomLevel.current * zoomFactor)
    );

    // 计算缩放后的偏移量
    const zoomRatio = newZoomLevel / zoomLevel.current;

    const newViewportX =
      viewport.current.x - (mouseX - viewport.current.x) * (zoomRatio - 1);
    const newViewportY =
      viewport.current.y - (mouseY - viewport.current.y) * (zoomRatio - 1);

    // 更新缩放和视口位置
    zoomLevel.current = newZoomLevel;

    const newViewPort = { x: newViewportX, y: newViewportY };

    viewport.current = newViewPort;

    const visibleIndexList = calculateVisibleTiles(
      canvasSize,
      zoomLevel.current,
      viewport.current,
      tilesX,
      tilesY,
      tileWidth,
      tileHeight
    );

    if (!wheelTimer.current) {
      wheelTimer.current = setTimeout(() => {
        let newResolution = curResolution;
        let transformedIndices = visibleIndexList;

        if (zoomLevel.current > tileSwitchLevel) {
          // 切换到更高分辨率
          newResolution = Math.min(resolutionNumber - 1, curResolution + 1);
          transformedIndices = Array.from(
            tilesTransform(
              visibleIndexList,
              true, // zoomIn
              tileSwitchLevel,
              tilesX
            )
          );
        } else if (zoomLevel.current < 1) {
          // 切换到更低分辨率
          newResolution = Math.max(0, curResolution - 1);
          transformedIndices = Array.from(
            tilesTransform(
              visibleIndexList,
              false, // zoomIn
              tileSwitchLevel,
              tilesX
            )
          );
        }
        // 否则保持当前分辨率

        const curLevel = newResolution + 1;

        handleWheelCallback?.({
          zoomLevel: zoomLevel.current,
          viewPort: viewport.current,
          type: EventType.Wheel,
          visibleIndexList: transformedIndices,
          curLevel: curLevel,
        });
        wheelTimer.current = null;
      }, 200);
    }
  };

  const handleCustomClick: (
    type: EventType
  ) => React.MouseEventHandler<HTMLCanvasElement> = (type: EventType) => {
    return (event) => {
      event.preventDefault();
      setRenderFlag((f) => !f);
      const rect = canvasRef.current?.getBoundingClientRect() as DOMRect;
      const clickX = event.clientX - rect.left;
      const clickY = event.clientY - rect.top;

      let clickCallback: ((event: TileMapEventInfo) => void) | undefined;

      switch (type) {
        case EventType.Click:
          clickCallback = handleClickCallback;
          break;
        case EventType.RightClick:
          clickCallback = handleRightClickCallback;
          break;
        case EventType.DoubleClick:
          clickCallback = handleDoubleClickCallback;
          break;
        default:
          clickCallback = handleClickCallback;
          break;
      }

      // 移动完成后不触发点击事件
      if (!isDragging.current) {
        if (type === EventType.Click) {
          if (!clickTimer.current) {
            clickTimer.current = setTimeout(() => {
              clickCallback?.({
                type: type,
                curLevel: curResolution + 1,
                viewPort: viewport.current,
                zoomLevel: zoomLevel.current,
                visibleIndexList: calculateVisibleTiles(
                  canvasSize,
                  zoomLevel.current,
                  viewport.current,
                  tilesX,
                  tilesY,
                  tileWidth,
                  tileHeight
                ),
                mouseInfo: {
                  coordinate: {
                    x: clickX,
                    y: clickY,
                  },
                  coordinateInTile: {
                    x: (clickX - viewport.current.x) / zoomLevel.current,
                    y: (clickY - viewport.current.y) / zoomLevel.current,
                  },
                },
              });
              clickTimer.current = null;
            }, 200);
          }
        } else {
          if (clickTimer.current) {
            clearTimeout(clickTimer.current);
            clickTimer.current = null;
          }

          clickCallback?.({
            type: type,
            curLevel: curResolution + 1,
            viewPort: viewport.current,
            zoomLevel: zoomLevel.current,
            visibleIndexList: calculateVisibleTiles(
              canvasSize,
              zoomLevel.current,
              viewport.current,
              tilesX,
              tilesY,
              tileWidth,
              tileHeight
            ),
            mouseInfo: {
              coordinate: {
                x: clickX,
                y: clickY,
              },
              coordinateInTile: {
                x: (clickX - viewport.current.x) / zoomLevel.current,
                y: (clickY - viewport.current.y) / zoomLevel.current,
              },
            },
          });
        }
      }
      isDragging.current = false;
    };
  };

  return (
    <canvas
      className="gaia-canvas"
      ref={canvasRef}
      width={canvasSize.width}
      height={canvasSize.height}
      onWheel={handleWheel}
      onMouseDown={handleMouseDown}
      onContextMenu={handleCustomClick(EventType.RightClick)}
      onClick={handleCustomClick(EventType.Click)}
      onDoubleClick={handleCustomClick(EventType.DoubleClick)}
    />
  );
};

export default memo(Gaia);
