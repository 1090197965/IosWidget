import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { Response, Request } from 'express';
import { FileCache } from '../util/fileCache.class';
import { IRecordData, ISendMessage } from '../interface/widget.interface';
import { ScriptableService } from '../service/scriptable.service';
import base64 from './base64';
// eslint-disable-next-line @typescript-eslint/no-var-requires
const dayjs = require('dayjs');

const FREQUENCY_KEY = 'FREQUENCY_KEY';
const RECORD_KEY = 'RECORD_KEY';
const SEND_MESSAGE_DATA = 'SEND_MESSAGE_DATA';
const MEET_CACHE = 'MEET_CACHE';

@Controller('scriptable')
export class ScriptableController {
  constructor(
    @Inject(FileCache) private readonly cacheManager: FileCache,
    private readonly service: ScriptableService,
  ) {
    this.service.setCache(cacheManager);
  }

  @Post('infos')
  async infos(@Body() body: ISendMessage, @Res() res: Response) {
    const driveName = await this.cacheManager.get<IRecordData>(
      RECORD_KEY + body.driveName,
    );
    let target = await this.cacheManager.get<IRecordData>(
      RECORD_KEY + body.target,
    );
    target = await this.service.mergeSendMessage(
      target,
      body.driveName,
      body.driveName,
      false,
    );
    res.json({
      code: 0,
      data: {
        driveName,
        target,
      },
      message: '',
    });
  }

  @Post('getBase64')
  getBase64(@Res() res: Response, @Query('name') name: string) {
    res.json({
      code: 0,
      data: base64,
      message: '',
    });
  }

  @Get('info')
  async info(
    @Res() res: Response,
    @Query('name') name: string,
    @Req() req: Request,
  ) {
    const list = await this.cacheManager.get<IRecordData[]>(
      FREQUENCY_KEY + name,
    );
    let info = await this.cacheManager.get<IRecordData>(RECORD_KEY + name);
    info = await this.service.mergeSendMessage(
      info,
      info.driveName,
      info.target,
      false,
    );
    info.dwellTimeMinutes = this.service.getDwellTimeMinutes(info, list);

    res.json({
      code: 0,
      data: {
        info,
        list,
      },
      message: '',
    });
  }

  @Post('sendMessage')
  async sendMessage(@Body() body: ISendMessage, @Res() res: Response) {
    body.createTime = new Date().getTime();
    body.mergeTotal = 0;
    await this.cacheManager.set(SEND_MESSAGE_DATA + body.driveName, body);

    res.json({
      code: 0,
      data: {
        body,
      },
      message: '',
    });
  }

  @Post('update')
  async update(
    @Body() body: IRecordData,
    @Res() res: Response,
    @Req() req: Request,
  ) {
    let targetData: IRecordData;
    let targetList: IRecordData[];
    const driveKey = FREQUENCY_KEY + body.driveName;
    const currentDriveKey = RECORD_KEY + body.driveName;
    const driveList = await this.cacheManager.wrap<IRecordData[]>(
      driveKey,
      async () => [],
    );

    const x = Math.floor(body.current100.longitude * 10000) / 10000;
    const mapX = Math.floor(body.current100.longitude * 10000 - 10) / 10000;
    const y = Math.floor(body.current100.latitude * 10000) / 10000;
    body.backgroundImg = `https://api.mapbox.com/styles/v1/1090197965/cliu0f4j6001201pe63ny5jbt/static/pin-l+1a8ed5(${x},${y})/${mapX},${y},15.43,0/750x350?access_token=pk.eyJ1IjoiMTA5MDE5Nzk2NSIsImEiOiJjbGZhb3F6Mmowenp2M3JrZWVtZzByYXU0In0.PwIlPetXWAiQiCvEowzZMw`;

    // 服务器和本地时区不同，需要计算出时间偏移量
    const timeOffect = new Date().getTimezoneOffset() / 60 + 8;
    body.time = dayjs().add(timeOffect, 'hour').format('YYYY-MM-DD HH:mm:ss');
    console.log(body);
    driveList.push(body);

    // 只需要最近-90条数据即可
    await this.cacheManager.set(driveKey, driveList.slice(-90));
    await this.cacheManager.set(currentDriveKey, body);

    if (body.target) {
      targetData = await this.cacheManager.get<IRecordData>(
        RECORD_KEY + body.target,
      );
      targetList = await this.cacheManager.wrap<IRecordData[]>(
        FREQUENCY_KEY + body.target,
        async () => [],
      );
    }

    if (!body.target || !targetData) {
      targetData = body;
      targetList = driveList;
    }

    targetData = await this.service.mergeSendMessage(
      targetData,
      body.driveName,
      body.target,
    );

    targetData.dwellTimeMinutes = this.service.getDwellTimeMinutes(
      targetData,
      targetList,
    );

    targetData.isMeet = this.service.isMeet(driveList, targetList);
    if (targetData.isMeet) {
      this.cacheManager.set(
        MEET_CACHE + body.driveName,
        true,
        60 * 60 * 2 * 1000,
      );
    }
    targetData.isMeetPast = await this.cacheManager.get(
      MEET_CACHE + body.driveName,
    );

    console.log('获取到的数据1', targetData);

    res.json({
      code: 0,
      data: targetData,
      message: '',
      version: 'v1',
      base64Length: JSON.stringify(base64).length + '',
    });
  }
}
