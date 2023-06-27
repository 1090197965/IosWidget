// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: light-gray; icon-glyph: magic;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { IEnv } from '../interface/Env';
import { IRecordData } from '../../interface/widget.interface';

const $: IEnv = importModule('Env');
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const widgetConfig = importModule('WidgetConfig');
const url = widgetConfig.url;

// 组件初始化
try {
  (async () => {
    const data = await record();
    const widget = await createWidget(data);
    if (config.runsInWidget) {
      Script.setWidget(widget);
      Script.complete();
    }
  })();
} catch (e) {
  log(e);
}

async function collect() {
  const data: IRecordData = {} as IRecordData;

  data.driveName = widgetConfig.driveName;
  data.batteryLevel = Device.batteryLevel();
  // data.volume = Device.volume();
  data.isCharging = Device.isCharging();
  data.systemName = Device.systemName();
  data.isInPortrait = Device.isInPortrait() || Device.isInPortraitUpsideDown();
  data.isInLandscape =
    Device.isInLandscapeLeft() || Device.isInLandscapeRight();
  data.isFace = Device.isFaceUp() || Device.isFaceDown();
  // data.uuid = UUID.string();

  // Location.setAccuracyToBest();
  // data.current = await Location.current();

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  Location.setAccuracyToHundredMeters();
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  data.current100 = await Location.current();

  return data;
}

async function getLocationImg(data: IRecordData) {
  const x = Math.floor(data.current100.longitude * 10000) / 10000;
  const mapX = Math.floor(data.current100.longitude * 10000 - 10) / 10000;
  const y = Math.floor(data.current100.latitude * 10000) / 10000;
  // 高德地图
  // const url = `https://restapi.amap.com/v3/staticmap?location=${x},${y}&zoom=14&size=750*300&markers=mid,,A:${x},${y}&key=0f88fa5e5a0bec965e1b71f9ce21823c`;
  // mapbox地图
  const url = `https://api.mapbox.com/styles/v1/1090197965/cliu0f4j6001201pe63ny5jbt/static/pin-l+1a8ed5(${x},${y})/${mapX},${y},15.43,0/750x350?access_token=pk.eyJ1IjoiMTA5MDE5Nzk2NSIsImEiOiJjbGZhb3F6Mmowenp2M3JrZWVtZzByYXU0In0.PwIlPetXWAiQiCvEowzZMw`;
  log(url);
  return await getImageByUrl(url, `temp_v2_${x}_${y}`);
}

async function record() {
  const data = await collect();
  const res = await $.post({
    url: url + '/scriptable/update',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  });
  log(res);
  return data;
}

// todo isFaceUp、 isFaceDown这种下不需要获取地址信息

// 倒计时到天
async function createWidget(data: IRecordData) {
  try {
    const widget = new ListWidget();
    const { width, height } = getWidgetSize('medium');
    const batteryLevel = Math.floor(Device.batteryLevel() * 1000) / 10;

    widget.setPadding(14, 8, 5, 8);
    const headerStack = widget.addStack();
    headerStack.addSpacer(7);
    widget.addSpacer();
    log({ width, height });
    const titleBgStack = widget.addStack();
    titleBgStack.centerAlignContent();
    titleBgStack.size = new Size(width - 10, 45);
    titleBgStack.backgroundColor = new Color('#000000', 0.3);
    titleBgStack.cornerRadius = 12;
    const titleStack = titleBgStack.addStack();
    titleStack.layoutVertically();
    const title = titleStack.addStack();
    title.addSpacer(7);
    title.addText(
      `当前电量：${batteryLevel}%, ${
        Device.isCharging() ? '充电中' : '躺平中'
      } ${new Date().getSeconds()}`,
    );
    title.addSpacer(7);

    const header = widget.addStack();
    header.layoutVertically();

    // const image = header.addImage(await getLocationImg(data));
    widget.backgroundImage = await getLocationImg(data);
    // image.containerRelativeShape = true;
    // image.imageSize = new Size(338, 158);
    // image.cornerRadius = 5;
    header.addSpacer();
    header.topAlignContent();

    // const line1 = header.addText(
    //   `当前电量：${batteryLevel}%, ${
    //     Device.isCharging() ? '充电中' : '躺平中'
    //   } ${new Date().getSeconds()}`,
    // );
    // line1.textColor = Color.black();
    // line1.textOpacity = 0.6;

    await widget.presentMedium();
    return widget;
  } catch (e) {
    log(e);
  }
}

async function getImageByUrl(url, cacheKey: string, useCache = true) {
  log(cacheKey);
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
    // 没有缓存+失败情况下，返回自定义的绘制图片（红色背景）
    const ctx = new DrawContext();
    ctx.size = new Size(100, 100);
    ctx.setFillColor(Color.red());
    ctx.fillRect(new Rect(0, 0, 100, 100));
    return await ctx.getImage();
  }
}

/**
 * 获取组件尺寸
 * @returns {json}
 * @param widgetFamily 组件尺寸【small】、【medium】、【large】
 */
function getWidgetSize(widgetFamily) {
  // 屏幕缩放比例
  let screenScale = Device.screenScale();
  // 宽度、高度
  let width, height;
  // 手机屏幕高度
  const screenHeight = Device.screenSize().height * screenScale;
  let phoneSize = phoneSizes()[screenHeight];
  log('获取到手机信息' + phoneSize);
  if (!phoneSize) {
    phoneSize = phoneSizes()['2556'];
    screenScale = 3;
  }
  // eslint-disable-next-line prefer-const
  width = phoneSize[widgetFamily] / screenScale;
  switch (widgetFamily) {
    case 'large':
      height = phoneSize[widgetFamily] / screenScale;
      break;
    default:
      height = phoneSize['small'] / screenScale;
      break;
  }
  return { width, height };
}

// 所有支持手机上小部件的像素大小和位置。
function phoneSizes() {
  return {
    // 14 Pro Max
    2796: {
      small: 510,
      medium: 1092,
      large: 1146,
      left: 99,
      right: 681,
      top: 282,
      middle: 918,
      bottom: 1554,
    },
    // 14 Pro
    2556: {
      small: 474,
      medium: 1014,
      large: 1062,
      left: 82,
      right: 622,
      top: 270,
      middle: 858,
      bottom: 1446,
    },
    // 13 Pro Max, 12 Pro Max
    2778: {
      small: 510,
      medium: 1092,
      large: 1146,
      left: 96,
      right: 678,
      top: 246,
      middle: 882,
      bottom: 1518,
    },
    // 12 and 12 Pro、14
    2532: {
      small: 474,
      medium: 1014,
      large: 1062,
      left: 78,
      right: 618,
      top: 231,
      middle: 819,
      bottom: 1407,
    },
    // 11 Pro Max, XS Max
    2688: {
      small: 507,
      medium: 1080,
      large: 1137,
      left: 81,
      right: 654,
      top: 228,
      middle: 858,
      bottom: 1488,
    },
    // 11, XR
    1792: {
      small: 338,
      medium: 720,
      large: 758,
      left: 54,
      right: 436,
      top: 160,
      middle: 580,
      bottom: 1000,
    },
    // 11 Pro, XS, X
    2436: {
      small: 465,
      medium: 987,
      large: 1035,
      left: 69,
      right: 591,
      top: 213,
      middle: 783,
      bottom: 1353,
    },
    // Plus phones
    2208: {
      small: 471,
      medium: 1044,
      large: 1071,
      left: 99,
      right: 672,
      top: 114,
      middle: 696,
      bottom: 1278,
    },
    // SE2 and 6/6S/7/8
    1334: {
      small: 296,
      medium: 642,
      large: 648,
      left: 54,
      right: 400,
      top: 60,
      middle: 412,
      bottom: 764,
    },
    // SE1
    1136: {
      small: 282,
      medium: 584,
      large: 622,
      left: 30,
      right: 332,
      top: 59,
      middle: 399,
      bottom: 399,
    },
    // 11 and XR in Display Zoom mode
    1624: {
      small: 310,
      medium: 658,
      large: 690,
      left: 46,
      right: 394,
      top: 142,
      middle: 522,
      bottom: 902,
    },
    // Plus in Display Zoom mode
    2001: {
      small: 444,
      medium: 963,
      large: 972,
      left: 81,
      right: 600,
      top: 90,
      middle: 618,
      bottom: 1146,
    },
  };
}
