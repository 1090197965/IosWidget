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
        // 自动更新仍然不生效， 应该可以通过导出安装的方法，手动执行即可
        // await record(widgetConfig.url, widgetConfig.target, true);
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

async function record(url, target, isCheckVersion = false) {
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

  if (isCheckVersion) {
    checkVersion(response.version);
  }

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

  const addressIconWidth = 65;
  const offset = Math.floor(width * 0.583 - 120 - 8 - addressIconWidth / 2);
  emojiStack.addSpacer(offset);
  const addressIconWrapStack = emojiStack.addStack();
  addressIconWrapStack.size = new Size(addressIconWidth, 65);
  // addressIconWrapStack.backgroundColor = new Color('#000000', 0.2);
  addressIconWrapStack.backgroundImage = await getAddressIcoImg(data.driveName);
  addressIconWrapStack.centerAlignContent();

  const addressIconStack = addressIconWrapStack.addStack();
  addressIconStack.size = new Size(addressIconWidth, 65);
  // addressIconStack.backgroundColor = new Color('#f31515', 0.2);
  addressIconStack.backgroundImage = await getAddressIcoImg('skin1');
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

    addressIconStack.addSpacer(4);

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
async function getAddressIcoImg(type: string): Promise<Image> {
  const config = {
    amiang:
      'data:image/png;base64,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',
    merge:
      'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAFAAAABQCAYAAACOEfKtAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAF+RJREFUeJztXOlzFOeZf/qeS3NIM5qRhIQEAkyMOBwWDBuzxElqk+AtnJhsHCe1HzZ/zn7YL5sPu1sVZ50Pqdq4vLVF+cja2diObWATAwaMzSkEutAxmnv67v09Pd14PJFdMSNkUqWHeqtnhpnu9/317znfpyXThnQl8pc9gb902QCwS/myABRWOXZ+tpp4bcfVXq+7rDeAnwec+BnfYfFWOX4WcOsK5noB2AmY2Pa6/b1Inw3gasMNxmqArguQ6wHgZwHVPqSOY/tvWEKQ+Oh0HNtfdwL5wEF8kAC2M2k1oHgoGBqG2jaktu+FwkAwSDaGhWFgmG3DaRvtrAyPD0weFICdjAtBkYMjgxbFiGH0BEcGjwGVBEFoV2UWj4VaADGAejBqGFWMZvC5HYwQTP+39AAdzYMAsB28kG1KcC0+MnAZjCS1gIsCMB8013U9HAnDP1KwaGAnYvAHCj6P4BjHewaImcgAVoJRC65pB3NoB/Le+dZS1hrATvBC0ELgGLQ0RoaBEEVRAmgMmIvXrqqqYjqdljYNDKm53qwWVSOS4znuwuKidWd22lgqLtumZYaAKPiNgt9HASaflwFcpBagenB9K5iPo4iyq4oK1e3mmoK4lgC2gxeqa2jXmHF91AIwKssyf8YLsfP5vHb40KHsgQMH89u2jG/K9KTTsUg0pimKJpIkeyK5RrNp1mr1RqlaLk3Pz9z9n9+9MXn6zJlSuVyyJEni6yRs22azwIwuYywHR54Ps5FczyXTtdxgrmsG4loBuBp4vCBWN2bcIB/BGBmDGeckEgnpJz/+ydh3vv3tPSMjI6PZbLaQ7EnmZVGOQXslPpkXmkHXIxDRBfv0erOxdPTJo5NTd+7c+v27v//4Zz/72STAcxVFUXFUwMY4fsFjnlpAspqTAwB5UMuxEK0RiGsBYCd4rK7MsARGlgcAS7Kdi8fjtHv37sT3jj89+ti+fdvGtmzZni/kt2paJC6I+Cd8ThICOwgljEWT8ZG+/uym8W3jeyd27Zr6+pGjF94/e/b6b//3jTmwsmKapgwQMxihJ18Jz9B2tjUDca0Y2Km2bO9yGAMYMbBOyOVy0pNffzJ74sSJ3QcPHjyUzfaNgTQRhu3PugJ/TcB6BZdEgcRoLJoCcycKhcLYxK6J2/v27Hn/X//9306/d+rUSqlcEmAbk+x82tbYCZZDayDdAtgZFIfsS1GLfT54Q0ND8g9OnBh6+vjTBx/ZufOxTG9mCLZL+eJXw+VYFa0mCbJGgqQIWkTpKRRyj0S0A0lFUtSBfOEPL7/6yvz8wl0HwlrAwLEz4XjRjwvh512muyhIZLlWVyxcCwBDEEOPy44ij9HD4MGrCs8999zI35/4wZGtW7fsi8eifSJ5sufYPiCC2BnyrSIIAT3Xbg38ztGr+KjEtpRcyyTbMCSV1IG9E48eialaIhntOfXif790+/bsHQtM5DiTHVid2jIXWAymZ9eBdjcArgYeT5bVtpdDlIGBAem5Z380/KMfPvuNsZHBfYpdTusLt/wMA6EeGKSSnMiSpCVJlCMthnWIx4yrLZJVukOuXgbzFP+SjlEms3iHqjM3qbZcJCGSlVM7n8iP5noPP3fieCaXzb71T//yz5dWSisEENkmMgv97MS/Ha7Dl/OCNdw3iN0C2Ol1e3mAGUoqlRKOffdY/pnvP3N4dPPIXkmfzzTunBXM5UlM1yZJVUmK9pDUkweIBVKy46Qk8mCk9KmLOI1l0qf/SMbsB/hZk+RUgeTkAHl6hczFa1SbPEcr07NkeSqVF6alzJY9mfzWAxN/c/Tx6ukPnph57TevFXVdZ7PCLOSMhWNEm0EEsXn+XWUp9wtge7IfAsihA9s+lTOJ3bt2J5/67lN7x6G2Gunp5txFoXnz9+RU5wAewrVInFxZInPhQyh0lJS+bZTY9g1SM5tbbORVOTqZ8+fJLl4lwWnAh4A1LkwZ1Bh+BBBg/YJGkhTxWbi8eIqqy0vCqKYlCmMHtn//+997ZPLW5NkLFy40wcBIACIH3EYwb6dtHfcFYrcAhgzkO+zntGz3IPa3nvzG0KOPbN8bV728W7op2UvXyGsiLIMmiQDOs3XYsjrUyybbcag2d4X0WolSO75JsfxOErU42aXbpN8+BeA8sLWXEcUVVXJtCyrcJLtZI8/UCeElGbpD5WKDGuZVUnp6xS3ZscL+rz722LFjx+7Ozc1NLi4uQpPdRHCTawF4PH/3M9b4wABcLWhm9mUAnsZp2djoWOSJxw/uzsWFcWfpQ4Vq8yQrCqnpIbIto2XFm4sYFbw3ybIcalarVFn5Dem6QYX9MYrnd1D95u/IreC36RHylCjnxKAJLtkokbkyT1Zlkcz6MlVLZarXDDIMnKdYoZmPLlF67FJ07Mk9O586dmzp4sWLpZMnTy5hbhrOwYE9x4Zh8SFkIcsXZmE3NrA93/Wjf3YcPKl/ePbHWzYXMjvFxnTMrd4Eg+x7BSoGwTKb1KyUyAYDTdMm0zBJbxjk1RbIu/0xpccXKJYbB/v+QEokDS1NkQeH41t9sNWsLpNRXiCzWSUDDETw7E+Iazi6btPS3CItTl4TxqxGenTz6M4jR45cePnllzkzURHasCpzylejT5uidVHhzsoyw+IXCXB3Va6mPProo4knDh3el466I051itz6EnkIVRwLC4XqNWvLVC8vwWaBgRZUEVGZbdn+8DiHK85SeeYyRbKjCFF0cmMqwJr3fy+ChUIkCZV3yXZd0sFcA/fGwe+UOOJCXScu0phNk8pzd2AWboqZ8QMIb/aMZzKZy8Vi0eF5thUfDOpSjbtVYR5+bS8oSbnf+uY3+0c2j4zKwnLEbK6Q1VjxbZyD4MEwDKrXa1QrV/Aac+bKFDPL4xgPqg0w69Um3bxwmiwtTwkBtq2yAHBh7xplmL+472QcZGmmoZNuGtBBieRYlGKqSKWSQaoClopsIkrUWJqivq374gMDg8OHDx9Og4WsxjJYyDedmRiWv+6bhffDwM5CaVhRFpBdCLsn9gwhCCvIniTYxhYYex327Q7UFqraNMi0RBLUXor19JKayMGhRKlWRUhSWiZOTnTToqmpZWrGztKejODHf1xDcQ3EwfUSzoMoRE2RDvtn6Q2SIxrsq4prNEmLYjnI81zMTBYRcJsNjvjETDrVf+jQofwrr7yyGOTI4ZxX20L4QiCuhReW+a7yh729verg4MBArCeRUmQ4ZVWDjbKpMjtHxSVkDrhcLDpE8WwOutNDSrqfFDVKU9eu0cfLZRobGqRYEoC4M1RbmiahP0mm3qQGBi9LwtVMa44EpQrwoN7s0QEeMjKwdIWiCRk2U/Zz5kQ6QbFUBgTXKKFGese3jhdwgz+yLCtctxYA2L738oXlfhn4KS/sp5VQ37179/bkIYqmRhDNQLUysGGDdGnGpQ8uztLwyFZ6/OAByuJ4/vx5ilSaNDDQR1XYsRuzS9SfK9Dm0SHK5XrJqdyA2jtkg6FNmAET9o7LiAqHQPUi2TbMAkyDJCEOlBk4DaGPCEYHAPYmEJgjUAfAiBN7Cv35gU2bNmmTk5MG33AwUQ3W37mB9UAB7AQzZKCIu0sjIyOxOIRTXM8xyYUNdGp3qdHQ6e6KCebh2/CqajxNucIgSfDI8UScto6OIByZoMFsxrdlClTZhR6y/RO0HrIcAc4HquvpxPVTSfJ8cOFHoIcKiVEFsR/SQZxPRqon8M1T4Lj0GrkIuvFa6UkkUsPDw9qtW7c4G+EtApk+vY16X9KNE+kcLjydoqrQGSyEUzBz+QoJtds0kovRrvER6u3vxXItMhGC9MV9s0meUaOk7NDO4TSJTo2sag12DXmyuYDg2KCm3EfX55DCgaV9mSRpkQjMnImMxOUcF0E1+TEkOyoB4DIDFYDI7DSqK37lRtZSiN0VFeklr9ejT1eQOtdG9AXs4JpUYwIhkA/zlGXXNjxj/qLQuI3UrTJL2wcV2jwwAtuVIsWdJWNxCuxaIhvxoGuDqVadZAfEcC0yENvJKbDJbcAZJEnK7aHC4e00NLSZCvk8aRrCmsqyn4W4AMmzbcSUi7Q09QEVZ6+S6XikAlQR4Akfvg3C5ym381vEGZKiKF2xbTVZq4Kqf8f4rhMnCy6nWiV4wYpfNMhkkEmIUeL/5lhOUjRasefhfe+QAABZZSOJGFI5ZCVQfS4oiDJSuYZFW3Y9Tl9JDfjMCgGTkdaZdXhugGg169BHmdRck6q352ihCG8MRvdHEJjbk1S6/SGltxzA7zvJtjbSLYCt8hCnWJ4nVKtV03aACADgMhSDpcUKALGHgxx4XNkvYXHYmsqNUjzZj2ykAhY2/VhPgu2KwvDL+J5RW8LvI37N78qF8/TB2bNgrEk7dmyj8e3byahXSS8vIiCfwWukdogxKZql+eYs7GWF5H6X4lER56+1WA5OG37w+Sk17VTVL1yZuR8AO/tSGEBO1EV4uHqdI2UxT54cw5dgi2DHXN3y7ZXDVh+/dF3TD7A507AQ8Jp61c80QBOSokmwEOEK8l21Z8T/XFVkSsYi1AA7G8t36cLZMq0gk+lPRimCeO/m1AyVSys0VMjR9i2bECMWKSMVSVPhVODckP6ZlUq1dOPGDZ1vdLCnHObBX0pBtR1EOwTw6tWrjXK5vAIXYMvxPsWM9pFVKyIrKPoscxF68PYiV2DMWsvAWwh2ucDg8f4wQhKRC9USp362X7ayYRMz6QztmthF9ZUVmpmZolPvvEtgOz32yBYa29RPBhBfrDQQBURoeCBBdo9HUqMBxiPOAott29VXSqXi7Oysn7phvpw8W/TZjUkPDMD2pp2wqccHkL0Ihwhzc3N3TcOqybFsRkkNQe3gGErzZFYXyTaaXMYEQlx+qgEkqJbH4YhIfm0TZ3ORXfDpRQFxX7RVsiINKRw8qwkmLi0XaWb6Fm+N0OxCigbBurHNIxQHQyOROMIglzhW9hyJ1Ch+F+8l3bAr09PTdwG6FQT9YYvIujOwsz+PJ8AVXg5ONV3X7XPnzt3cv/ex2f6EkpGxcDGSIFeBWgp1srg8z54Xea+D2M71FLADbOP9EQDpIE2zkN8KogdvK1PEsXADGgCaUzisF6o/PtxPySP7AIrpq7qBHLkv3UMjmwYQ2jhk1RdgHpAW4lpaZoii/Vu9UsOcffPNN6eCbVM3mDPHgzZ9YorWBcB2IEMWsjroXKzkgPqtt95a+Lu/PXandyyzDTxS2eNqyb7WxdQ4PG0RNq9BTAQuhpoGl7QMv2hKrTYP2DyV/IQCiY5gl/Exs1TBBzacTIzyA4N+JYcvLnNgrWkcUZIN8DyriHPopKXylIT3jeS260s352YA4ArmKLX11Bj0CQPvW4278cKhCvNEGpiYjVhLRYpW/fjqx1c257+6W/OkQQ8sEgUXaTFyVjcK1UMOHEvBeVThabFogOfrI4coAE+UBN9bi6Lre2GRN9PMGgCK82YkPLXrB9OuBg8Np8Nbk5y6uXYVSllElmL7OXZqeA9lxg54rpJauT39/p35+XmeJ6dw/nypbZuzCwzuW4XDcCBkIJeFeN9BgRf2Tr7y8tU9O7dcH+5N5KCdioUww25W/DI8s0yJ9IAtOpdYwDbkr/DWNm/PuoKfhrXiDACZ3uQDKbkrwLjM/Rkk2TwFsBFeHmgFql9GlrcEewc7WNhL8fw2Sg1NgPkjxp25u7feP3duJujuYgnb4kIn0u5IHjiAIYjtToQnwh1RJe6UQk6svfRfLy0c+853zvZ//a+3SsnRQWf5tmAinHHANs5hBYBgNGt+iHKv7Y+LqarCGYN/alcQKTvxFIn6jG83OeAWnApu1xJUH+orxslDZsOhkYNYUkGinX/0OKWHd1M0PYgZSu7C/N2ZU/935swb//vGPFfLuYcmAC8EsLOzdV0ADEGkNhD5rnI3VBogcpIr/vbN392a2DNxcXRgWzxm1JIOKaJTgY1q8kYSAh01BfVDdoHMAktDwu+1wGOiIBCP9Y1RdutheO8ZZDERaPEiCUYFDhyqi7AHASORmsR5EmB0Hxi3m1KbvuLbWdbpWqVW/PjqlfMvvvTitY8++sho3ShfdUv0if3rCrxuAQzVmCfCaswl8hJ3R3Hf3uuvv744NDj49nPP/lAd3vRX+yPZLT2N5TtCvThDzdJdspG/umCOqFi8Qcn1BzAwSko0TbHsZsps3oswpgefbfVTN9uoAmw9KJI6fswoa/h/eHlJRnqoxXBU/d1esL1xe2rq0q9+9at3Tp0+7TcXBbHfYgDgmrCvGwDbQQy7QJmFPNkkWJheWFjwfv3ii9O9vb2nnnn6mUyhsH1nLLtVSxtVob5ylxrFOeSyZSRYoSkSEbel/OQ/3jdEkWSOuNOXe2C0ZIE0Kty7LIPtG7SOTgZuA7Yss7mwuHDj1OlTZ1/5zasLiP34Y75A2DdotM35S23tIGrLRqhVGgq7RDWAGENqZz7/i19cGx4a/sPXDn8tls1lR6KpgQjAEdKD436tzvfAQYeFhGBZBGBcBG31zKwmwmodID54CIcaiwuLN9557723f/HLFz6E53U4hcR/1YN5rZntC6VbBhJ94skYRL67y8F5C5h4DOmd/h+/fOGc67j2/v37HxsYHNgai8d61WiP5Ae2LSp1swYGyG02GqUpqC1U9o/PP//8h6dPn64CPM57WTMYvCK1TE2YA69JB/9aMTDstWMk+G7zHixPfoD3YV9/4/Xi9evX3zt+/Pjtp44d2zcxMfF4Op0a5I5VP3IW/KLifU0AntWoVCrzV69cOf/zn//8zVdfe3Vhbm7eDsDjbGMhGPz6oQMwlDAVCsv8PFlmIrdS9WExkclbk9YLv3xh6vqN65Wf/uNPaxO7J/b1ZXqHo7Fo+l6v4J8LIle8XddqNBorUNMb586ePfefv/71ZTiupVqt5gUVlxA8Zh9737ATYU1UN5S1ALAzpLGC9xwb+l4ai8lxjLi8vOy99tprRRzfO3r06NSRJ47s2LZt21fAxv5oNJpUVDUWdDf86UVaggzO1Ov1RrFUWlm4eXPy6smTJz9495135i9eumSAjX7ZjFo3cIlaALJGsGlZU+aFsqYVafpTdWanwhM3sfgsRg/3MJ86dap25cqVG+++++784wcPXt6+Y0ffQKGQzfXnCj09yWQkEokzK0NCWpZlNBrNOjxquQj4b926NXvlytWVixcvFs+cOVMBE91AZa3gmmzvOCLgmxiWrtoLBw8dgCyhPQxfE33iXHgRrEYMYgZ2MVYsFr233367irEC1nmKokjj4+Px7du3x0ZGRuKJREJtOWKBlpeLOkCrA/T69PS0AUDZxvmbQtwHzeAF52d1ZdPRCVx78fShfU6EpR1Eu+19CCSrFsdjvQCRUwY1sH8SQBEuX75cx6jRny7U37wKmsYFdj6szi7XxVrxZ5hhFIP34TN1nfHeQ/+kUihcFuDHtTw/0GvFvg4OIRMZRO7VS3AjeNAxpQQPzYTdAp3CNpCZZ+P7fgmNWvatHJyT34egtdu7BwYey4MA0J+oyvsbouS2UlDPtkEYx3N5/4SBbM+fw0YfLQAy7FnpfNy1/UnNsFU3rOu1q+nnPf665vLAHnc1XMvrVaK84+QAOE8hybNxtFxb4Pcut9wHxVj6pFEzfCgx3PQOAQxV0QdK4MpqxyOufFO4vSRI29blUVeiB/zAddGo+AuISZqryaonwt7zA0nc4G05tg+S6/dS+fUEvPb83CRI1lq79S3xWdR6vgNn8U0DF3W4rkMOuM01a08WJM/y7DV/Hu7zZF0e+W84hscjqcaFHiXmPy5jiNy05jFlRP+pQ8/B0eXm8RaI3OovyMEzr1wNbdlUTlsEHxwBJsHxnyCpmHWfbRI/OEP2ugAXyrr+0Qks1OtTk8Qs0kRVqNtNfmaVmcRlKC7o+9gxhGCToIgtAFnlfRfS6t7z+PcMIiMdEVU3ZLruGOu5HF/W/c+eTNbm7u3s9Wkpv5Gr1dngtnqgucNKVMhyHWanDyCAhP10/Ac7eCh+Cu3v6NNUfX5dGdcpX+of3lk2yqsv3rr3yus4PnTyMP/loocWtHZ5mAH8i5ANALuUDQC7lA0Au5QNALuUDQC7lA0Au5QNALuUDQC7lA0Au5QNALuUDQC7lA0Au5QNALuUDQC7lA0Au5QNALuUDQC7lA0Au5T/B52aZjVVfxAuAAAAAElFTkSuQmCC',
    qp: 'data:image/png;base64,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',
    skin1:
      'data:image/png;base64,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',
  };
  const base64 = config[type];

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
