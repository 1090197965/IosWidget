// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: brown; icon-glyph: download;
/**
 * Author: GideonSenku
 * Github: https://github.com/GideonSenku
 */
// Install Scripts.js
const $ = importModule('Env');
const urlDev = 'http://10.81.3.113:9000';
const urlProd = 'https://nas.qppp.top:22431';
let initConfig = false;

try {
  importModule('WidgetConfig');
} catch (e) {
  initConfig = true;
  log('不存在包，初始化配置文件');
  log(e);
}

const scripts = [
  {
    moduleName: 'CountDown',
    url: urlProd + '/script/CountDown.js',
  },
  // {
  //   moduleName: 'Env',
  //   url: urlProd + '/script/Env.js',
  // },
  // {
  //   moduleName: 'Install Scripts',
  //   url: urlProd + '/script/Install%20Scripts.js',
  // },
  // {
  //   moduleName: 'Install Scripts Dev.js',
  //   url: urlProd + '/script/Install%20Scripts%20Dev.js',
  // },
];

if (initConfig) {
  scripts.push({
    moduleName: 'WidgetConfig',
    url: urlProd + '/script/WidgetConfigAMiang.js',
  });
}

function update() {
  log('🔔更新脚本开始!');
  scripts.forEach((script) => {
    $.getFile(script);
  });
  log('🔔更新脚本结束!');
}
update();
