// @flow

import MemoryHandler from './memory-handler';
import type { Logger, Callback } from '@verdaccio/types';
import type { ILocalData } from '@verdaccio/local-storage';

export type ConfigMemory = { limit?: number };
export type MemoryLocalStorage = { files: any, secret: string, list: any };

const DEFAULT_LIMIT: number = 1000;
class LocalMemory implements ILocalData {
  path: string;
  limit: number;
  logger: Logger;
  data: MemoryLocalStorage;
  config: ConfigMemory;
  locked: boolean;

  constructor(config: ConfigMemory, options: any) {
    this.config = config;
    this.limit = config.limit || DEFAULT_LIMIT;
    this.logger = options.logger;
    this.data = this._createEmtpyDatabase();
  }

  getSecret(): string {
    return this.data.secret;
  }

  setSecret(secret: string) {
    this.data.secret = secret;
  }

  add(name: string, cb: Callback) {
    const { list } = this.data;

    if (list.length < this.limit) {
      if (list.indexOf(name) === -1) {
        list.push(name);
      }
      cb(null);
    } else {
      this.logger.info({ limit: this.limit }, 'Storage memory has reached limit of @{limit} packages');
      cb(new Error('Storage memory has reached limit of limit packages'));
    }
  }

  remove(name: string, cb: Callback) {
    const { list } = this.data;
    const item = list.indexOf(name);

    if (item !== -1) {
      list.splice(item, 1);
    }

    cb(null);
  }

  get(cb: Callback) {
    cb(null, this.data.list);
  }

  sync() {
    // nothing to do
  }

  getPackageStorage(packageInfo: string) {
    return new MemoryHandler(packageInfo, this.data.files, this.logger);
  }

  _createEmtpyDatabase(): MemoryLocalStorage {
    const list: any = [];
    const files: any = {};
    const emptyDatabase = {
      list,
      files,
      secret: ''
    };

    return emptyDatabase;
  }
}

export default LocalMemory;
