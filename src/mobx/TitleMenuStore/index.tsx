import { action, makeAutoObservable, observable } from "mobx";

class TitleMenuStore {
  disabledMap = observable.map<string, boolean>({
    netlist: true,
    sdc: true,
    def: true,
    spef_sdf: true,
    top_schematic: true,
    report_timing: true,
  });

  constructor() {
    makeAutoObservable(this);
  }

  setDisabled = action((keys: string[], disabled: boolean) => {
    keys.forEach((key) => {
      this.disabledMap.set(key, disabled);
    });
  });

  isDisabled(key: string): boolean {
    return this.disabledMap.get(key) ?? false;
  }
}

export const titleMenuStore = new TitleMenuStore();
