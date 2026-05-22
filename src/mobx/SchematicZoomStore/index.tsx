// 维护Schematic中Zoom状态
import { makeAutoObservable } from "mobx";
class SchematicZoomStore {
  public schematicScaleMap = new Map<string, number>();
  public forceLoadFlag = false;

  constructor() {
    makeAutoObservable(this);
  }

  zoomIn(gaiaId: string) {
    const scale = this.schematicScaleMap.get(gaiaId) ?? 1;
    const newScale = Math.min(scale * 2, 20);
    this.schematicScaleMap.set(gaiaId, newScale);
  }

  zoomOut(gaiaId: string) {
    const scale = this.schematicScaleMap.get(gaiaId) ?? 1;
    const newScale = Math.max(scale * 0.5, 0.1);
    this.schematicScaleMap.set(gaiaId, newScale);
  }

  zoomReset(gaiaId: string) {
    this.schematicScaleMap.set(gaiaId, 1);
    this.toggleForceLoad();
  }

  getScale(gaiaId: string) {
    return this.schematicScaleMap.get(gaiaId) ?? 1;
  }

  toggleForceLoad() {
    this.forceLoadFlag = !this.forceLoadFlag;
  }
}
export const schematicZoomStore = new SchematicZoomStore();
