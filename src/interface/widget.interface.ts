export interface IRecordData {
  driveName: string;
  target: string;
  systemName: string;
  batteryLevel: number;
  isCharging: boolean;
  config: any;
  volume: number;
  time?: string;
  current?: CurrentLocation;
  current100?: CurrentLocation;
  /**
   * 仅限开启了重力感应后，才有效果：垂直
   */
  isInPortrait: boolean;
  /**
   * 仅限开启了重力感应后，才有效果：横向
   */
  isInLandscape: boolean;
  /**
   * 仅限开启了重力感应后，才有效果：朝下或者朝上
   */
  isFace: boolean;
  uuid: string;
  backgroundImg: string;
  backgroundImgHash: string;
}

interface CurrentLocation {
  verticalAccuracy: number;
  horizontalAccuracy: number;
  altitude: number;
  latitude: number;
  longitude: number;
}
