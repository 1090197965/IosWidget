import { Injectable } from '@nestjs/common';
import { IRecordData, ISendMessage } from '../interface/widget.interface';
import { FileCache } from '../util/fileCache.class';

const FREQUENCY_KEY = 'FREQUENCY_KEY';
const RECORD_KEY = 'RECORD_KEY';
const SEND_MESSAGE_DATA = 'SEND_MESSAGE_DATA';

@Injectable()
export class ScriptableService {
  protected cacheManager: FileCache;

  setCache(cacheManger) {
    this.cacheManager = cacheManger;
  }

  /**
   *
   * @param additionData 需要追加消息的数据
   * @param readInfoName 获取对应的已读消息，如果传入值为qp，则获取qp发送的消息的可读信息
   * @param messageName 获取消息本体信息，如果传入的值为qp，这获取qp发送的消息
   * @param isWidget
   */
  async mergeSendMessage(
    additionData: IRecordData,
    readInfoName = '',
    messageName = '',
    isWidget = true,
  ) {
    additionData.message = '';
    additionData.emojiImg = '';
    additionData.emojiCount = 0;
    additionData.sendMessageReadCount = 0;

    const message = await this.cacheManager.get<ISendMessage>(
      SEND_MESSAGE_DATA + messageName,
    );
    const sendMessage = await this.cacheManager.get<ISendMessage>(
      SEND_MESSAGE_DATA + readInfoName,
    );
    if (message) {
      additionData.message = message.message;
      additionData.emojiImg = message.emojiImg;
      additionData.emojiCount = message.emojiCount;

      if (isWidget) {
        message.mergeTotal = message.mergeTotal + 1;

        const time = new Date().getTime();
        const diff = time - message.createTime;
        // 如果发送时间超过1个小时并且读的次数超过3次
        if (message.mergeTotal >= 3 && diff > 90 * 60 * 1000) {
          await this.cacheManager.del(SEND_MESSAGE_DATA + messageName);
        } else {
          await this.cacheManager.set(SEND_MESSAGE_DATA + messageName, message);
        }
      }
    }

    // 检查消息是否已读
    if (sendMessage) {
      additionData.isSendMessage = true;
      additionData.sendMessageReadCount = sendMessage.mergeTotal;
    } else {
      additionData.isSendMessage = false;
    }

    return additionData;
  }

  /**
   * 计算停留在当前时间的时长
   * @param data
   * @param list
   */
  getDwellTimeMinutes(data: IRecordData, list: IRecordData[]) {
    const longitudeTolerate = 0.002;
    const latitudeTolerate = 0.0026;
    const longitude = data.current100.longitude; // 114.05844
    const latitude = data.current100.latitude; // 22.64547
    let infoRecent: IRecordData;
    let isEnd = false;

    list
      .slice()
      .reverse()
      .forEach((item) => {
        const longitudeDiff = Math.abs(longitude - item.current100.longitude);
        const latitudeDiff = Math.abs(latitude - item.current100.latitude);
        if (
          !isEnd &&
          longitudeDiff <= longitudeTolerate &&
          latitudeDiff <= latitudeTolerate
        ) {
          infoRecent = item;
        } else {
          isEnd = true;
        }
      });

    if (infoRecent) {
      console.log('infoRecent', infoRecent);
      return (
        (new Date().getTime() -
          new Date(infoRecent.time + ' GMT+0800').getTime()) /
        1000 /
        60
      );
    } else {
      return 0;
    }
  }

  isSimilar(data: IRecordData, data1: IRecordData, multiply = 1) {
    const longitudeTolerate = 0.002; // 大约1km左右
    const latitudeTolerate = 0.0026; // 大约1km左右
    const longitude = data.current100.longitude; // 114.05844
    const latitude = data.current100.latitude; // 22.64547
    const longitudeDiff = Math.abs(longitude - data1.current100.longitude);
    const latitudeDiff = Math.abs(latitude - data1.current100.latitude);

    return (
      longitudeDiff <= longitudeTolerate * multiply &&
      latitudeDiff <= latitudeTolerate * multiply
    );
  }

  isMeet(driveList: IRecordData[], targetList: IRecordData[]) {
    const contrastDrive = driveList.slice().reverse().slice(0, 5);
    const contrastTarget = targetList.slice().reverse().slice(0, 5);
    let isMeet = false;
    const time = new Date().getTime();

    // 如果最近两个节点时间点相差较远，则直接返回否
    const firstDrive = contrastDrive[0];
    const firstTarget = contrastTarget[0];
    if (!this.isSimilar(firstDrive, firstTarget, 3)) {
      return false;
    }

    // 对比最近的5次节点，如果最近的5次节点中有任意两个节点位置在1km以内
    // 并且节点时间相差不超过15分钟
    // 只检查1小时内的所有节点
    contrastDrive.forEach((drive) => {
      // 距离当前超过1个小时的节点直接跳过
      if (
        isMeet ||
        time - new Date(drive.time + ' GMT+0800').getTime() > 60 * 60 * 1000
      ) {
        return;
      }

      contrastTarget.forEach((target) => {
        // 距离当前超过1个小时的节点直接跳过
        if (
          isMeet ||
          time - new Date(target.time + ' GMT+0800').getTime() > 60 * 60 * 1000
        ) {
          return;
        }

        if (this.isSimilar(drive, target)) {
          isMeet = true;
        }
      });
    });

    return isMeet;
  }
}
