import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Query, Req,
  Res
} from "@nestjs/common";
import { Response, Request } from 'express';
import { FileCache } from '../util/fileCache.class';
import { IRecordData, ISendMessage } from "../interface/widget.interface";
const dayjs = require('dayjs');

const FREQUENCY_KEY = 'FREQUENCY_KEY';
const RECORD_KEY = 'RECORD_KEY';
const SEND_MESSAGE_DATA = 'SEND_MESSAGE_DATA';

@Controller('scriptable')
export class ScriptableController {
  constructor(@Inject(FileCache) private readonly cacheManager: FileCache) {}

  @Post('infos')
  async infos(@Body() body: ISendMessage, @Res() res: Response) {
    const driveName = await this.cacheManager.get(RECORD_KEY + body.driveName);
    const target = await this.cacheManager.get(RECORD_KEY + body.target);
    res.json({
      code: 0,
      data: {
        driveName,
        target,
      },
      message: '',
    });
  }

  @Get('info')
  async info(@Res() res: Response, @Query('name') name: string, @Req() req: Request) {
    const list = await this.cacheManager.get(FREQUENCY_KEY + name);
    let info = await this.cacheManager.get<IRecordData>(RECORD_KEY + name);
    info = await this.mergeSendMessage(info, req)

    res.json({
      code: 0,
      data: {
        info,
        list,
      },
      message: '',
    });
  }

  async mergeSendMessage(data: IRecordData, req) {
    const message = await this.cacheManager.get<ISendMessage>(SEND_MESSAGE_DATA + data.driveName);
    if (message) {
      data.message = message.message;
      data.emojiImg = message.emojiImg;
      data.emojiCount = message.emojiCount;

      message.mergeTotal = message.mergeTotal + 1;

      const time = new Date().getTime();
      const diff = time - message.createTime;
      // 如果发送时间超过1个小时并且读的次数超过3次
      if (message.mergeTotal >= 3 && diff > 90 * 60 * 1000) {
        await this.cacheManager.del(SEND_MESSAGE_DATA + message.driveName);
      } else {
        await this.cacheManager.set(SEND_MESSAGE_DATA + message.driveName, message);
      }
    }

    return data;
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
  async update(@Body() body: IRecordData, @Res() res: Response, @Req() req: Request) {
    let rsData: IRecordData;
    const cacheKey = FREQUENCY_KEY + body.driveName;
    const recordKey = RECORD_KEY + body.driveName;
    const cache = await this.cacheManager.wrap<IRecordData[]>(
      cacheKey,
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
    cache.push(body);

    await this.cacheManager.set(cacheKey, cache.splice(cache.length - 90));
    await this.cacheManager.set(recordKey, body);

    if (body.target) {
      rsData = await this.cacheManager.get<IRecordData>(RECORD_KEY + body.target);
    }

    if (!body.target || !rsData) {
      rsData = body;
    }

    console.log('获取到的数据', rsData);
    rsData = await this.mergeSendMessage(rsData, req);

    res.json({
      code: 0,
      data: rsData,
      message: '',
      version: 'V3',
    });
  }
}
