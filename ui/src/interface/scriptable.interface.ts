import { IRecordData, ISendMessage } from "../../../src/interface/widget.interface";

export interface IWidgetRecordData extends IRecordData {}
export interface IAppSendMessage extends ISendMessage {}
export interface IAppRecordData extends IRecordData {}

export interface IResponse<T> {
  code: number;
  data: T;
  message: string;
}

export interface IHomeInfos {
  driveName: IWidgetRecordData;
  target: IWidgetRecordData;
}
