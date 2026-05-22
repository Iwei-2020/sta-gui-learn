import { makeAutoObservable } from "mobx";

class FileStore {
  files: Map<string, string[]> = new Map();

  constructor() {
    makeAutoObservable(this);
  }

  // 添加文件（自动去重）
  addFiles(type: string, paths: string[]) {
    const currentFiles = this.files.get(type) || [];

    const newFiles = paths.filter(
      (path) => !currentFiles.some((existingPath) => existingPath === path)
    );

    if (newFiles.length > 0) {
      this.files.set(type, [...currentFiles, ...newFiles]);
    }
  }

  removeFile(type: string, path: string) {
    const currentFiles = this.files.get(type) || [];
    this.files.set(
      type,
      currentFiles.filter((f) => f !== path)
    );
  }

  clearFiles(type: string) {
    this.files.set(type, []);
  }

  getFiles(type: string) {
    return this.files.get(type) as string[];
  }
}

export const fileStore = new FileStore();
