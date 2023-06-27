export interface IEnv {
  dict: string;
  get({ url, headers }: any, callback?: any): Promise<any>;
  getStr({ url, headers }: any, callback?: any): Promise<any>;
  post({ url, body, headers }: any, callback?: any): Promise<any>;
  _post({ url, body, headers }: any, callback?: any): Promise<any>;
  getFile({ moduleName, url }: any): Promise<void>;
  require({ moduleName, url, forceDownload }: any): any;
  write(fileName: any, content: any): boolean;
  isFileExists(fileName: any): boolean;
  initFile(fileName: any): any;
  read(fileName: any): string;
  setdata(Val: any, Key: any): boolean;
  getdata(Key: any): string;
  hasdata(Key: any): boolean;
  rmdata(Key: any): boolean;
  msg(title: any, message: any, btnMes?: any): void;
  input(
    title: any,
    message: any,
    placeholder: any,
    value?: any,
  ): Promise<string>;
  time(fmt: any, ts?: any): any;
  createWidget({ title, texts, spacing, preview }: any): Promise<ListWidget>;
  provideText(string: any, container: any, format: any): any;
  // eslint-disable-next-line @typescript-eslint/ban-types
  setupLocation(lockLocation?: boolean): Promise<{}>;
  renderBattery(): string;
  logErr(e: any, messsage: any): void;
}
