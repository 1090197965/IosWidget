import { IEnv } from "../interface/Env";
import { IRecordData } from "../interface/widget.interface";

const $: IEnv = importModule('Env');
const widgetConfigModule = importModule('WidgetConfig');
const widgetConfig = await widgetConfigModule.getConfig();

if (config.runsInAccessoryWidget) {
  if (!$.hasdata('warm-up-count3')) {
    $.setdata('warm-up-count3', '0');
  }
  $.setdata('warm-up-count3', (parseInt($.getdata('warm-up-count3')) + 1) + '');
}

const rs = $.getdata('ABL-demo');
const address = $.getdata('ABL-address');
log('获取成功: ' + rs);
log(JSON.parse(address))

const apiRs = await record(widgetConfig.url, widgetConfig.target);
const img = await getLocationImg(apiRs);

const warmUpWidget = new ListWidget();
warmUpWidget.setPadding(10, 10, 10, 10);
warmUpWidget.addText($.getdata('warm-up-count3') + '热身' + rs);

Script.setWidget(warmUpWidget);
Script.complete();

async function record(url, target) {
  const data = await collect(target);
  const res = await $.post({
    url: url + '/scriptable/update',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  log('后端响应');
  const response = JSON.parse(res);
  log(res);
  // checkVersion(response.version);

  const suffix = widgetConfig.suffix ? widgetConfig.suffix : '';
  $.setdata('Home-Widget-Data' + suffix, res)
  return response.data as IRecordData;
}

async function collect(target = '') {
  const data: IRecordData = {} as IRecordData;

  data.target = target;
  data.driveName = widgetConfig.driveName;
  data.batteryLevel = Device.batteryLevel();
  data.config = config;

  data.isCharging = Device.isCharging();
  data.systemName = Device.systemName();

  // 获取储存在缓存里的位置信息
  data.current100 = JSON.parse(await $.getdata('ABL-address'));

  log('数据采集成功');
  log(data);

  return data;
}

async function getLocationImg(data: IRecordData) {
  let x: number;
  let mapX: number;
  let y: number;
  x = Math.floor(data.current100.longitude * 10000) / 10000;
  mapX = Math.floor(data.current100.longitude * 10000 - 10) / 10000;
  y = Math.floor(data.current100.latitude * 10000) / 10000;
  if (!data.backgroundImg) {
    log('本地生成背景图URL');
  } else {
    log('从服务器获取图片');
  }

  const url = data.backgroundImg
    ? data.backgroundImg
    : `https://api.mapbox.com/styles/v1/1090197965/cliu0f4j6001201pe63ny5jbt/static/pin-l+1a8ed5(${x},${y})/${mapX},${y},15.43,0/750x350?access_token=pk.eyJ1IjoiMTA5MDE5Nzk2NSIsImEiOiJjbGZhb3F6Mmowenp2M3JrZWVtZzByYXU0In0.PwIlPetXWAiQiCvEowzZMw`;
  log(url);
  return await getImageByUrl(
    url,
    `temp_v3_${x}_${y}`,
  );
}

async function getImageByUrl(url, cacheKey: string = '', useCache = true) {
  log(url + cacheKey);
  const cacheFile = FileManager.local().joinPath(
    FileManager.local().temporaryDirectory(),
    cacheKey,
  );
  log(cacheFile);
  // 判断是否有缓存
  if (useCache && FileManager.local().fileExists(cacheFile)) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return Image.fromFile(cacheFile);
  }
  try {
    const req = new Request(url);
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const img = await req.loadImage();
    // 存储到缓存
    FileManager.local().writeImage(cacheFile, img);
    return img;
  } catch (e) {
    log('图片加载失败');
    log(e);
    // 没有缓存+失败情况下，返回自定义的绘制图片（红色背景）
    const ctx = new DrawContext();
    ctx.size = new Size(100, 100);
    ctx.setFillColor(Color.red());
    ctx.fillRect(new Rect(0, 0, 100, 100));
    return await ctx.getImage();
  }
}
