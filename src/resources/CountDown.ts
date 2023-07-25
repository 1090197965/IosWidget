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
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
const widgetConfig = await widgetConfigModule.getConfig();

// 组件初始化
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
await run();

// 刷新之后日期
// refreshAfterDate 可以通过这个属性控制刷新时间

async function run() {
  if (config.runsInWidget) {
    const data = await record(widgetConfig.url, widgetConfig.target);
    const widget = await createWidget(data);
    Script.setWidget(widget);
    Script.complete();
  } else if (config.runsInApp) {
    let rs = 0;
    if (args.widgetParameter !== 'widget') {
      log(args);
      const notice = new Alert();
      notice.addAction('发送消息');
      notice.addAction('预览组件');
      notice.addCancelAction('取消操作');
      rs = await notice.presentSheet();
    }

    switch (rs) {
      case -1:
        return;
      case 0:
        const web = new WebView();
        await web.loadURL(
          widgetConfig.control +
            `/#/?driveName=${widgetConfig.driveName}&target=${widgetConfig.target}&ver=1`,
        );
        await web.present(true);
        break;
      case 1:
        const data = await record(widgetConfig.url, widgetConfig.target);
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
  // data.config = config;

  data.isCharging = Device.isCharging();
  data.systemName = Device.systemName();

  try {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    Location.setAccuracyToHundredMeters();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    data.current100 = await Location.current();
    $.setdata('ABL-address', JSON.stringify(data.current100));
  } catch (e) {
    data.current100 = JSON.parse($.getdata('ABL-address'));
    log('定位错误');
    log(e);
  }

  log('数据采集成功');
  log(data);

  return data;
}

async function getLocationImg(data: IRecordData) {
  const x: number = Math.floor(data.current100.longitude * 10000) / 10000;
  const mapX: number =
    Math.floor(data.current100.longitude * 10000 - 10) / 10000;
  const y: number = Math.floor(data.current100.latitude * 10000) / 10000;

  if (!data.backgroundImg) {
    log('本地生成背景图URL');
  } else {
    log('从服务器获取图片');
  }

  const url = data.backgroundImg
    ? data.backgroundImg
    : `https://api.mapbox.com/styles/v1/1090197965/cliu0f4j6001201pe63ny5jbt/static/pin-l+1a8ed5(${x},${y})/${mapX},${y},15.43,0/750x350?access_token=pk.eyJ1IjoiMTA5MDE5Nzk2NSIsImEiOiJjbGZhb3F6Mmowenp2M3JrZWVtZzByYXU0In0.PwIlPetXWAiQiCvEowzZMw`;
  log(url);
  const cacheX = x.toFixed(3);
  const cacheY = y.toFixed(3);
  console.log(`当前获取到的坐标为${x}_${y}，缓存为：${cacheX}_${cacheY}`);

  return await getImageByUrl(url, `temp_v3_${cacheX}_${cacheY}`);
}

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

    // 表情+历史停留时间记录
    const emojiStack = widget.addStack();
    await messageRender(emojiStack, data, width);

    const floor = widget.addStack();
    const bubbleStack = floor.addStack();

    // 灰色的信息背景块，显示电池和信息
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

    // 信息发送状态
    if (data.isSendMessage) {
      let sendStatusIcon: string;
      let fontSize: number;
      if (data.sendMessageReadCount === 0) {
        sendStatusIcon = '☷✉';
        fontSize = 12;
      } else {
        sendStatusIcon = '☑'; // data.sendMessageReadCount
        fontSize = 16;
      }

      battery.addSpacer(3);
      const sendStatus = battery.addStack();
      const sendText = sendStatus.addText(sendStatusIcon);
      sendText.textColor = new Color('#ffffff', 0.8);
      sendText.font = Font.systemFont(fontSize);
    }

    bubbleStack.addSpacer();
    floor.addSpacer();

    widget.backgroundImage = await getLocationImg(data);
    return widget;
  } catch (e) {
    log(e);
  }
}

async function messageRender(
  stack: WidgetStack,
  data: IRecordData,
  width: number,
) {
  stack.layoutVertically();

  log('开始加载表情');
  const messageWarp = stack.addStack();
  // messageWarp.layoutVertically();

  const messageStack = messageWarp.addStack();
  messageStack.layoutVertically();
  messageStack.centerAlignContent();
  messageStack.size = new Size(0, 30);

  if (data.message) {
    messageStack.backgroundColor = new Color('#ffffff', 0.7);
  }

  messageStack.cornerRadius = 10;
  messageStack.setPadding(8, 8, 8, 8);
  messageStack.centerAlignContent();

  const messageText = messageStack.addText(data.message ?? ' ');
  messageText.centerAlignText();
  messageText.textColor = new Color('#000000', 0.5);
  messageText.font = Font.systemFont(12);

  const emojiStack = stack.addStack();
  emojiStack.layoutHorizontally();
  emojiStack.bottomAlignContent();

  const emojiContentStack = emojiStack.addStack();
  emojiContentStack.size = new Size(120, 60);
  emojiStack.layoutHorizontally();
  emojiStack.bottomAlignContent();

  if (data.emojiImg) {
    const emoji = emojiContentStack.addImage(await getBase64Img(data.emojiImg));
    emoji.imageSize = new Size(60, 60);
  }

  if (data.emojiCount > 0) {
    const count = emojiContentStack.addStack();
    count.size = new Size(60, 60);
    count.centerAlignContent();
    count.layoutHorizontally();
    const countText = count.addText('x' + data.emojiCount);
    countText.textColor = new Color('#000000', 0.5);
    countText.font = Font.systemFont(12);
    count.addSpacer();
  }

  const addressIconWidth = 40;
  const offset = Math.floor(width * 0.583 - 120 - 8 - addressIconWidth / 2);
  emojiStack.addSpacer(offset);
  const addressIconStack = emojiStack.addStack();
  addressIconStack.size = new Size(addressIconWidth, 60);
  // addressIconStack.backgroundColor = new Color('#000000', 0.2);
  addressIconStack.backgroundImage = await getAddressIcoImg(data);
  addressIconStack.layoutVertically();
  addressIconStack.bottomAlignContent();

  // 只有停留超过半个钟才显示停留时长
  if (data.dwellTimeMinutes > 30) {
    addressIconStack.addSpacer();
    const timeWarpStack = addressIconStack.addStack();
    timeWarpStack.size = new Size(addressIconWidth, 0);
    timeWarpStack.centerAlignContent();

    const timeStack = timeWarpStack.addStack();
    timeStack.setPadding(2, 4, 2, 4);
    timeStack.size = new Size(0, 15);
    timeStack.backgroundColor = new Color('#000000', 0.3);
    timeStack.cornerRadius = 5;

    let text = '';
    if (data.dwellTimeMinutes < 60) {
      text = Math.floor(data.dwellTimeMinutes) + 'M';
    } else if (data.dwellTimeMinutes < 1440) {
      text = Math.floor(data.dwellTimeMinutes / 60) + 'H';
    } else {
      text = Math.floor(data.dwellTimeMinutes / 1440) + 'D';
    }

    const timeText = timeStack.addText(text);
    timeText.font = Font.systemFont(10);
    timeText.textColor = new Color('#ffffff', 0.7);
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
    flash.addSpacer(3);
  } else {
    // 电池电量百分比
    const titleStack = titleBgStack.addStack();
    const titleText = titleStack.addText(
      `${Math.floor(batteryLevelFloat * 100)}%`,
    );
    titleText.font = Font.systemFont(12);
    titleText.textColor = new Color('#ffffff', 0.8);
    titleStack.addSpacer(3);
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
  space.backgroundColor = new Color(
    '#000000',
    config.runsInAccessoryWidget ? 1 : 0.35,
  );
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

async function getImageByUrl(url, cacheKey = '', useCache = true) {
  log(url + cacheKey);
  const cacheFile = FileManager.local().joinPath(
    FileManager.local().temporaryDirectory(),
    cacheKey,
  );
  log(cacheFile);
  // 判断是否有缓存
  if (useCache && FileManager.local().fileExists(cacheFile)) {
    log('地图读取缓存文件');
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

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
async function getAddressIcoImg(data: IRecordData): Promise<Image> {
  const config = {
    qp: 'data:image/png;base64,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',
    amiang:
      'data:image/png;base64,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',
  };
  const base64 = config[data.driveName];

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
