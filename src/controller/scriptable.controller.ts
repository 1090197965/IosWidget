import {
  Body,
  Controller,
  Get,
  Inject,
  Post,
  Query,
  Res,
} from '@nestjs/common';
import { Response } from 'express';
import { FileCache } from '../util/fileCache.class';
import { IRecordData } from '../interface/widget.interface';
const dayjs = require('dayjs');

const FREQUENCY_KEY = 'FREQUENCY_KEY';
const RECORD_KEY = 'RECORD_KEY';

@Controller('scriptable')
export class ScriptableController {
  constructor(@Inject(FileCache) private readonly cacheManager: FileCache) {}

  @Get('infos')
  async infos(@Res() res: Response) {
    const qp = await this.cacheManager.get(RECORD_KEY + 'qp');
    const amiang = await this.cacheManager.get(RECORD_KEY + 'amiang');
    res.json({
      code: 0,
      data: {
        qp,
        amiang,
      },
      message: '',
    });
  }

  @Get('info')
  async info(@Res() res: Response, @Query('name') name: string) {
    const list = await this.cacheManager.get(FREQUENCY_KEY + name);
    const info = await this.cacheManager.get(RECORD_KEY + name);
    res.json({
      code: 0,
      data: {
        info,
        list,
      },
      message: '',
    });
  }

  @Post('update')
  async update(@Body() body: IRecordData, @Res() res: Response) {
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

    this.cacheManager.set(cacheKey, cache.splice(cache.length - 90));
    this.cacheManager.set(recordKey, body);

    if (body.target) {
      rsData = await this.cacheManager.get(RECORD_KEY + body.target);
    }

    if (!body.target || !rsData) {
      rsData = body;
    }

    console.log('获取到的数据', rsData);

    res.json({
      code: 0,
      data: rsData,
      message: '',
      version: 'V3',
    });
  }
}
