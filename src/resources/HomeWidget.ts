// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: light-gray; icon-glyph: magic;
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { IEnv } from '../interface/Env';
import { IRecordData } from '../interface/widget.interface';

const $: IEnv = importModule('Env');
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const widgetConfigModule = importModule('WidgetConfig');
const widgetConfig = await widgetConfigModule.getConfig();

// 组件初始化
await run();

async function run() {
  if (config.runsInWidget) {
    const data = await record();
    const widget = await createWidget(data);
    Script.setWidget(widget);
    Script.complete();
  } else if (config.runsInApp) {
    const notice = new Alert();
    notice.addAction('发送消息');
    notice.addAction('预览组件');
    notice.addCancelAction('取消操作');
    const rs = await notice.presentSheet();

    switch (rs) {
      case -1:
        return;
      case 0:
        const web = new WebView();
        web.loadURL(widgetConfig.control + `/#/?driveName=${widgetConfig.driveName}&target=${widgetConfig.target}`);
        web.present();
        break;
      case 1:
        const data = await record();
        const widget = await createWidget(data);
        await widget.presentMedium();
        break;
    }
  }
}

async function collect(target = '') {
  const data: IRecordData = {} as IRecordData;

  data.target = target;
  data.driveName = widgetConfig.driveName;
  data.batteryLevel = Device.batteryLevel();
  data.config = config;

  // try {
  //   data.volume = Device.volume();
  // } catch (e) {
  //   log('获取音量数据失败');
  //   log(e);
  // }

  data.isCharging = Device.isCharging();
  data.systemName = Device.systemName();
  // data.isInPortrait = Device.isInPortrait() || Device.isInPortraitUpsideDown();
  // data.isInLandscape =
  //   Device.isInLandscapeLeft() || Device.isInLandscapeRight();
  // data.isFace = Device.isFaceUp() || Device.isFaceDown();

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  Location.setAccuracyToHundredMeters();
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  data.current100 = await Location.current();

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

async function record() {
  const suffix = widgetConfig.suffix ? widgetConfig.suffix : '';
  const res = $.getdata('Home-Widget-Data' + suffix)
  const response = JSON.parse(res);
  log('获取缓存数据');
  log(response);
  // checkVersion(response.version);
  return response.data as IRecordData;
}

async function createWidget(data: IRecordData) {
  try {
    const widget = new ListWidget();
    const { width, height } = getWidgetSize('medium');
    const batteryLevel = Math.floor(data.batteryLevel * 1000) / 1000;

    log({ width, height });
    widget.setPadding(10, 10, 10, 10);
    widget.addSpacer();

    if (data.emojiImg) {
      log('开始加载表情');
      const emoji = widget.addStack();
      emoji.size = new Size(40, 40);
      emoji.backgroundImage = await getBase64Img(data.emojiImg);
    }

    const floor = widget.addStack();
    const bubbleStack = floor.addStack();

    // 灰色的信息块，显示电池和信息
    bubbleStack.layoutVertically();
    bubbleStack.centerAlignContent();
    bubbleStack.size = new Size(110, 35);
    bubbleStack.backgroundColor = new Color('#000000', 0.3);
    bubbleStack.cornerRadius = 10;
    bubbleStack.addSpacer(8);

    // 显示数据更新信息
    const row1 = bubbleStack.addStack();
    row1.addSpacer(8);
    const text = row1.addText(' ↙：');
    text.font = Font.systemFont(10);
    text.textColor = new Color('#ffffff', 0.7);
    const date = row1.addDate(new Date(data.time));
    date.font = Font.systemFont(10);
    date.textColor = new Color('#ffffff', 0.7);
    date.applyTimeStyle();
    const text2 = row1.addText('↗：');
    text2.font = Font.systemFont(10);
    text2.textColor = new Color('#ffffff', 0.7);
    const date2 = row1.addDate(new Date());
    date2.font = Font.systemFont(10);
    date2.textColor = new Color('#ffffff', 0.7);
    date2.applyTimeStyle();

    const row2 = bubbleStack.addStack();
    row2.addSpacer(8);
    const battery = row2.addStack();
    battery.centerAlignContent();
    await getBatteryIcon(battery, batteryLevel, data.isCharging);

    bubbleStack.addSpacer();
    floor.addSpacer();

    widget.backgroundImage = await getLocationImg(data);
    return widget;
  } catch (e) {
    log(e);
  }
}

async function getBatteryIcon(
  titleBgStack,
  batteryLevelFloat,
  batteryIsCharging,
) {
  if (batteryIsCharging) {
    // 充电标记
    const flash = titleBgStack.addStack();
    const flashIco = flash.addImage(await getFlashIcoImg());
    flashIco.imageSize = new Size(20, 20);
    flashIco.resizable = true;
    flashIco.textColor = new Color('#ffffff', 0.8);
    flashIco.applyFittingContentMode();
    flash.addSpacer(5);
  } else {
    // 电池电量百分比
    const titleStack = titleBgStack.addStack();
    const titleText = titleStack.addText(`${(batteryLevelFloat * 100).toFixed(1)}%`);
    titleText.font = Font.systemFont(14);
    titleText.textColor = new Color('#ffffff', 0.8);
    titleStack.addSpacer(5);
  }

  // 电池本体功能
  const batteryWarp = titleBgStack.addStack();
  batteryWarp.centerAlignContent();

  // 电池本体
  const battery = batteryWarp.addStack();
  const size = { width: 30, height: 15 };
  const border = 1.5;
  battery.setPadding(border, border, border, border);
  battery.size = new Size(size.width, size.height);
  battery.backgroundColor = new Color('#ffffff', 0.8);
  battery.cornerRadius = 4;

  const space = battery.addStack();
  const remainWidth = parseInt(
    (
      (batteryLevelFloat < 0.1 ? 0.1 : batteryLevelFloat) *
      (size.width - border * 4)
    ).toFixed(),
  );

  // 电池空白处（深色）
  space.size = new Size(size.width - border * 2, size.height - border * 2);
  space.cornerRadius = 2;
  space.backgroundColor = new Color('#000000', config.runsInAccessoryWidget ? 1 : 0.35);
  space.setPadding(border, border, border, border);

  // 剩余电量
  const remain = space.addStack();
  remain.size = new Size(remainWidth, size.height - border * 4);
  remain.backgroundColor = new Color(
    getBatteryColor(batteryLevelFloat * 100, batteryIsCharging),
    0.8,
  );
  remain.cornerRadius = 2;
  space.addSpacer(size.width - remainWidth - border * 4);

  // 电器正极头
  const batteryHead = batteryWarp.addStack();
  batteryHead.size = new Size(3, 6);
  batteryHead.backgroundColor = new Color('#ffffff', 0.8);
  batteryHead.cornerRadius = 4;
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
    log('获取图片缓存数据');
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

/**
 * 版本检查，如果版本与线上不一致则自动检查更新
 * @param version
 */
function checkVersion(version: string) {
  try {
    log('开始检查版本, 当前系统返回版本号：' + version);
    if (!$.hasdata('map_widget_check_version')) {
      log('当前无版本信息，已存储当前版本信息');
      $.setdata('map_widget_check_version', version);
    }

    const currentVersion: string = $.getdata('map_widget_check_version');
    if (version !== currentVersion) {
      log('版本不一致，开始更新系统');
      importModule('Install Scripts Dev');
    } else {
      log('版本一致，已是最新系统');
    }
  } catch (e) {
    log(e);
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
  log('获取到手机信息');
  log(phoneSize);
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

function getBatteryColor(
  batteryLevel: number,
  batteryIsCharging = false,
): string {
  if (batteryLevel >= 70 || batteryIsCharging === true) {
    return '#4DDA67';
  }

  if (batteryLevel >= 40) {
    return '#ffffff';
  }

  if (batteryLevel > 10) {
    return '#FF9503';
  }

  return '#FF3B2F';
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

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
async function getFlashIcoImg(): Promise<Image> {
  const base64 =
    'data:image/png;base64,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';

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return await new Request(base64).loadImage();
}

async function getBase64Img(base64: string) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return await new Request(base64).loadImage();
}

function actionUrl(name = '', data = '') {
  const u = URLScheme.forRunningScript();
  const q = `act=${encodeURIComponent(name)}&data=${encodeURIComponent(data)}`;
  let result = '';
  if (u.includes('run?')) {
    result = `${u}&${q}`;
  } else {
    result = `${u}?${q}`;
  }
  return result;
}
