export interface IWaveform {
  winName: string;
  summaryId: number;
  pathId: number;
  singlePathInfo: IPathInfo;
}

export interface IPathInfo {
  startpoint: string;
  endpoint: string;
  slack: string;
}

interface ICommonClockInfo {
  clockName: string;
  risePosition: number;
  declinePosition: number;
  period: number;
}

export interface IStartClockInfo extends ICommonClockInfo {
  startpoint: string;
}

export interface IEndClockInfo extends ICommonClockInfo {
  endpoint: string;
}

export interface IPathDelay {
  startPosition: number;
  value: number;
}

export interface IRequiredInfo {
  startPostion: number;
  endPosition: number;
}
