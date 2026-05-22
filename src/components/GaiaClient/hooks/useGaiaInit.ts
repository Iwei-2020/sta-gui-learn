import { useEffect, useLayoutEffect, useMemo, useState } from 'react';
import { ICanvasSize, ITilesNum, TileDataProps } from '../interface';

function useGaiaInit(
  tileData: TileDataProps[],
  viewport: React.RefObject<{
    x: number;
    y: number;
  }>,
  tilesNumPerResolution: ITilesNum | ITilesNum[],
  canvasSize: ICanvasSize,
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
) {
  const [tileWidth, setTileWidth] = useState(0);
  const [tileHeight, setTileHeight] = useState(0);
  // x轴瓦片数量
  const [tilesX, setTilesX] = useState<number>(
    tilesNumPerResolution instanceof Array ? tilesNumPerResolution[0].x : tilesNumPerResolution.x,
  );
  // y轴瓦片数量
  const [tilesY, setTilesY] = useState<number>(
    tilesNumPerResolution instanceof Array ? tilesNumPerResolution[0].y : tilesNumPerResolution.y,
  );
  // 计算单个瓦片图宽高
  useLayoutEffect(() => {
    if (tileData[0]) {
      const img = new Image();
      img.src = `data:image/png;base64,${tileData[0].blockBase64Str}`;

      img.onload = () => {
        setTileHeight(img.height);
        setTileWidth(img.width);
      };
    }
  }, []);

  // 初次渲染将瓦片图移动到视图最中央
  useEffect(() => {
    const fullWidth = tilesX * tileWidth;
    const fullHeight = tilesY * tileHeight;
    if (viewport.current) {
      viewport.current.x = ((canvasSize.width as number) - fullWidth) / 2;
      viewport.current.y = ((canvasSize.height as number) - fullHeight) / 2;
    }
    // viewport.current = {
    //   x: ((canvasSize.width as number) - fullWidth) / 2,
    //   y: ((canvasSize.height as number) - fullHeight) / 2,
    // };
  }, [tileWidth, tileHeight]);

  // 防止wheel事件默认行为
  useEffect(() => {
    const canvas = canvasRef.current as HTMLCanvasElement;
    const handleWheelWithPreventDefault = (event: any) => {
      event.preventDefault();
    };

    canvas.addEventListener('wheel', handleWheelWithPreventDefault);
    return () => {
      canvas?.removeEventListener('wheel', handleWheelWithPreventDefault);
    };
  }, []);

  // 处理每次传入的tileData
  const updateData = useMemo(() => {
    return tileData.map((item) => {
      const { blockBase64Str, index } = item;
      const img = new Image();
      img.src = `data:img/png;base64,${blockBase64Str}`;
      const x = tileWidth * (index % tilesX);
      const y = tileHeight * Math.floor(index / tilesX);
      return { img, x, y, index };
    });
  }, [tileData, tilesX, tileWidth]);

  return {
    updateData,
    tileWidth,
    tileHeight,
    tilesX,
    setTilesX,
    tilesY,
    setTilesY,
  };
}

export default useGaiaInit;
