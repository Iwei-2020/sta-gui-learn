import { makeAutoObservable } from "mobx";

class TabStore {
  tabExists = {
    rightArea: false,
  };

  private gaiaLevelMap = new Map<string, number>();

  // gaia渲染数据
  gaiaRenderDataMap = new Map<
    string,
    { index: number; blockBase64Str: string }[]
  >();

  constructor() {
    makeAutoObservable(this);
  }

  setTabExists(tab: "rightArea", exist: boolean) {
    this.tabExists[tab] = exist;
  }
  getTabExists(tab: "rightArea") {
    return this.tabExists[tab];
  }

  // gaiaId & level
  setGaiaLevel(id: string, level: number) {
    this.gaiaLevelMap.set(id, level);
  }

  getGaiaLevelMap() {
    return Array.from(this.gaiaLevelMap.entries()).map(([gaiaId, level]) => ({
      gaiaId,
      level,
    }));
  }

  setGaiaRenderData(
    gaiaId: string,
    imagesData: { index: number; blockBase64Str: string }[]
  ) {
    this.gaiaRenderDataMap.set(gaiaId, imagesData);
  }
}

export const tabStore = new TabStore();
