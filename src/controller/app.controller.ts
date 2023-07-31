import { Controller, Get } from '@nestjs/common';
import { AppService } from '../service/app.service';
import axios from 'axios';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
  @Get('test')
  async getTest(): Promise<string> {
    return JSON.stringify({ test: 111 });
  }

  @Get('getAddress')
  async getAddress(): Promise<string> {
    const info = await axios.get(
      'https://restapi.amap.com/v3/geocode/regeo?output=json&location=113.940332,22.577612&key=464badf2d4d12fcffa617473c24893fb&radius=1000&extensions=base',
    );

    const adcode = info.data.regeocode.addressComponent.adcode;
    const weather = await axios.get(
      `https://restapi.amap.com/v3/weather/weatherInfo?city=${adcode}&key=464badf2d4d12fcffa617473c24893fb&output=json`,
    );

    return JSON.stringify({
      info: info.data,
      weather: weather.data,
    });
  }
}
