import { IRecordData } from "../../../src/interface/widget.interface";

export interface IWidgetRecordData extends IRecordData {}

export interface IResponse<T> {
  code: number;
  data: T;
  message: string;
}

export interface IHomeInfos {
  qp: IWidgetRecordData;
  amiang: IWidgetRecordData;
}
