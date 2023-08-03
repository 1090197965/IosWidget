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
const map_widget_check_base64 = 'map_widget_check_base64';
const base64_content = 'base64_content';
const map_widget_check_version = 'map_widget_check_version';

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
        // 自动更新仍然不生效， 报错资源文件过大，需要优化
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

  await checkImage(response.base64Length);

  if (isCheckVersion) {
    await checkVersion(response.version);
  }

  return response.data as IRecordData;
}

async function createWidget(data: IRecordData) {
  try {
    const { width, height } = getWidgetSize('medium');
    const listWidget = new ListWidget();
    listWidget.backgroundImage = await getLocationImg(data);

    const widget = listWidget.addStack();
    widget.layoutVertically();
    widget.topAlignContent();
    widget.size = new Size(width, height);

    const batteryLevel = Math.floor(data.batteryLevel * 1000) / 1000;

    if (data.backgroundImageSkin) {
      widget.backgroundImage = await getBase64Image(data.backgroundImageSkin);
    } else {
      // 用来做天气使用的背景图
      widget.backgroundImage = await getDefaultBackgroundImage();
    }

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
    // bubbleStack.backgroundColor = new Color('#000000', 0.3);
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

    return listWidget;
  } catch (e) {
    log('生成组件错误');
    log(e);
  }
}

async function messageRender(
  stack: WidgetStack,
  data: IRecordData,
  width: number,
) {
  stack.layoutVertically();

  log('开始加载message');
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

  log('开始加载emoji表情');
  const emojiStack = stack.addStack();
  emojiStack.layoutHorizontally();
  emojiStack.bottomAlignContent();

  const emojiContentStack = emojiStack.addStack();
  emojiContentStack.size = new Size(120, 60);
  emojiStack.layoutHorizontally();
  emojiStack.bottomAlignContent();

  if (data.emojiImg) {
    const emoji = emojiContentStack.addImage(
      await base64ToImage(data.emojiImg),
    );
    emoji.imageSize = new Size(60, 60);
  }

  log('开始加载emoji count数');
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

  log('开始加载坐标图标');
  const addressIconWidth = 65;
  const offset = Math.floor(width * 0.583 - 120 - 8 - addressIconWidth / 2);
  emojiStack.addSpacer(offset);
  const addressIconWrapStack = emojiStack.addStack();
  addressIconWrapStack.size = new Size(addressIconWidth, 65);
  // addressIconWrapStack.backgroundColor = new Color('#000000', 0.2);

  let icon;
  if (data.addressIcon) {
    icon = data.addressIcon;
  } else {
    icon = data.isMeet === true ? 'merge' : data.driveName;
  }

  addressIconWrapStack.backgroundImage = await getBase64Image(icon);
  addressIconWrapStack.centerAlignContent();

  const addressIconStack = addressIconWrapStack.addStack();
  addressIconStack.size = new Size(addressIconWidth, 65);
  // addressIconStack.backgroundColor = new Color('#f31515', 0.2);

  // 坐标的皮肤控制
  if (data.addressIconSkin) {
    addressIconStack.backgroundImage = await getBase64Image(
      data.addressIconSkin,
    );
  } else if (data.isMeet || data.isMeetPast === true) {
    addressIconStack.backgroundImage = await getBase64Image('skin1');
  }

  addressIconStack.layoutVertically();
  addressIconStack.bottomAlignContent();

  log('开始加载停留时长');
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
    const flashIco = flash.addImage(await getBase64Image('flash'));
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

async function getBase64File(cacheKey = '') {
  log('读取base64配置临时文件');
  const cacheFile = FileManager.local().joinPath(
    FileManager.local().temporaryDirectory(),
    cacheKey,
  );
  log(cacheFile);
  // 判断是否有缓存
  if (FileManager.local().fileExists(cacheFile)) {
    log('地图读取缓存文件');
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    return JSON.parse(FileManager.local().readString(cacheFile));
  } else {
    return null;
  }
}

async function setBase64File(fileName = '', base64 = '') {
  log('保存base64配置到临时文件');
  const cacheFile = FileManager.local().joinPath(
    FileManager.local().temporaryDirectory(),
    fileName,
  );
  try {
    FileManager.local().writeString(cacheFile, JSON.stringify(base64));
    return base64;
  } catch (e) {
    log('base64列表加载失败');
    log(e);
    return {};
  }
}

/**
 * 版本检查，如果版本与线上不一致则自动检查更新
 * @param version
 */
async function checkVersion(version: string) {
  try {
    log('开始检查版本, 当前系统返回版本号：' + version);
    if (!$.hasdata(map_widget_check_version)) {
      log('当前无版本信息，已存储当前版本信息');
      $.setdata(map_widget_check_version, version);
    }

    const currentVersion: string = $.getdata(map_widget_check_version);
    if (version !== currentVersion) {
      log('版本不一致，开始更新');
      // await $.getFile({
      //   moduleName: 'CountDown',
      //   url: widgetConfig.url + '/script/CountDown.js',
      // });
    } else {
      log('版本一致，已是最新系统');
    }
  } catch (e) {
    log('版本对比错误');
    log(e);
  }
}

async function getBase64() {
  log('开始读取临时图片文件');
  const rs = await getBase64File('imageListV1.json');

  log('已获取图片文件信息' + typeof rs);
  return rs;
}

async function reloadBase64() {
  log('开始请求图片数据' + widgetConfig.url + '/scriptable/getBase64');
  const res = await $.post({
    url: widgetConfig.url + '/scriptable/getBase64',
    headers: {
      'Content-Type': 'application/json',
    },
  });
  log('后端响应');
  const response = JSON.parse(res);
  const rs = response.data;
  log('保存到icloud');
  await setBase64File('imageListV1.json', rs);

  return rs;
}

async function checkImage(base64Length: string) {
  try {
    log('开始检查版本, 当前base64长度：' + base64Length);
    if (!$.hasdata(map_widget_check_base64)) {
      log('当前base64长度，已存储当前base64长度');
      $.setdata(map_widget_check_base64, base64Length);
    }

    const currentVersion: string = $.getdata(map_widget_check_base64);
    if (`${base64Length}` !== `${currentVersion}`) {
      log('base64长度不一致，开始更新表情包信息');
      await reloadBase64();
      $.setdata('map_widget_check_base64', base64Length);
    } else {
      log('base64长度一致，已是最新');
    }
  } catch (e) {
    log('图片版本对比错误');
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

async function getDefaultBackgroundImage() {
  return await base64ToImage(
    'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAC/BAMAAAAiHJeoAAAAGFBMVEUAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABWNxwqAAAACHRSTlMATUI5NioVDkwNmNAAAAC2SURBVHja7dqhrQJAEEXRET/5liEUAAoLJPQBHYDAI+g/CDSLGEImm3M6uGLNvgkAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAgJ+6HbJgebxED48sWt2jg/9NVm2jg78sW0UH16xr8UrOWXeKBvZZt4sGNlm3jgbyCxbRgBAhL0KECBkTIkTImBAhQsaECBEyJkSIkDEhQoR84BN79llhmqFnmultmjF0mnl6moOBeU44AADgvSezT87p5XwRlwAAAABJRU5ErkJggg==',
  );
}

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
async function getBase64Image(type: string): Promise<Image> {
  log('开始加载base图片' + type);
  const config = await getBase64();
  log('获取到图片信息列表：' + Object.keys(config).join(', '));
  let base64 = '';
  const defaultBase64 =
    'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAEALAAAAAABAAEAAAICRAEAOw==';
  try {
    base64 = config[type];
  } catch (e) {
    log('获取图片报错' + type);
    log(e);
    base64 = defaultBase64;
  }

  if (!base64) {
    base64 = defaultBase64;
  }

  // log('获取到的base64信息' + base64);

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return await new Request(base64).loadImage();
}

async function base64ToImage(base64: string) {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return await new Request(base64).loadImage();
}
