import { useLayoutEffect, useState } from 'react';
import { ITilesNum } from '../interface';

function useTileImageCache(
  enableCache: boolean,
  tileSwitchLevel: number,
  curResolution: number,
  resolutionNumber: number,
  tileTotal: number,
  zoomLevel: React.MutableRefObject<number>,
  updateData: {
    img: HTMLImageElement;
    x: number;
    y: number;
    index: number;
  }[],
  tilesNumPerResolution: ITilesNum | ITilesNum[],
  setCurResolution: React.Dispatch<React.SetStateAction<number>>,
  setTilesX: (value: React.SetStateAction<number>) => void,
  setTilesY: (value: React.SetStateAction<number>) => void,
) {
  // 每次渲染所用到的数据缓存瓦片图
  const [imgCache, setImgCache] = useState<
    Map<number, { img: HTMLImageElement; x: number; y: number; index: number }>
  >(new Map());

  // 瓦片图分辨率切换时的处理逻辑
  useLayoutEffect(() => {
    let newImgCache: Map<number, { img: HTMLImageElement; x: number; y: number; index: number }>;
    // 在放大到切换瓦片图的临界level时的处理
    const curZoomLevel = zoomLevel.current!;
    if (curZoomLevel > tileSwitchLevel && curResolution < resolutionNumber - 1) {
      // 在分辨率切换的时候，清空缓存
      newImgCache = new Map();
      // 修复瓦片图扩张切换带来的偏移值,并且防止无限制放大
      zoomLevel.current = curZoomLevel / tileSwitchLevel;
      setCurResolution((cur) => cur + 1);
    } else if (curZoomLevel < 1 && curResolution > 0) {
      // 在分辨率切换的时候，清空缓存
      newImgCache = new Map();
      // 在缩小到切换瓦片图的临界level时，修复瓦片图缩减切换带来的偏移值
      zoomLevel.current = curZoomLevel * tileSwitchLevel;
      setCurResolution((cur) => cur - 1);
    } else {
      if (enableCache) {
        newImgCache = new Map(imgCache);
      } else {
        newImgCache = new Map();
      }

      updateData.forEach((img) => {
        if (img.index < tileTotal) {
          newImgCache.set(img.index, img);
        }
      });
    }
    setImgCache(newImgCache);
  }, [updateData]);

  // 切换分辨率时，更新x，y轴瓦片数量
  useLayoutEffect(() => {
    if (tilesNumPerResolution instanceof Array) {
      setTilesX(tilesNumPerResolution[curResolution].x);
      setTilesY(tilesNumPerResolution[curResolution].y);
    }
  }, [curResolution]);

  return { imgCache, setImgCache };
}

export default useTileImageCache;
