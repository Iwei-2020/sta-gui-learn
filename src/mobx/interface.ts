export interface IBusiness {
  /**
   * 保存业务数据
   * @returns data 导出的数据模型的业务数据 {string}
   */
  save: () => string;
  /**
   * 将业务数据导入，恢复当前数据模型
   * @param data 业务数据 {string}
   */
  restore: (data: string) => void;
}
