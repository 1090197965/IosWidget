// Variables used by Scriptable.
// These must be at the very top of the file. Do not edit.
// icon-color: brown; icon-glyph: download;
/**
 * Author: GideonSenku
 * Github: https://github.com/GideonSenku
 */
// Install Scripts.js
const $ = importModule('Env');
// const widgetConfig = importModule('WidgetConfig');
const urlDev = 'http://10.81.3.113:9000';
const urlProd = 'https://nas.qppp.top:22431';

const scripts = [
  {
    moduleName: 'CountDown',
    url: urlDev + '/script/CountDown.js',
  },
  {
    moduleName: 'WidgetConfig',
    url: urlDev + '/script/WidgetConfig.js',
  },
  // {
  //   moduleName: 'Env',
  //   url: url + '/script/Env.js',
  // },
  {
    moduleName: 'Install Scripts',
    url: urlDev + '/script/Install%20Scripts.js',
  },
  {
    moduleName: 'Install Scripts Dev',
    url: urlDev + '/script/Install%20Scripts%20Dev.js',
  },
];

function update() {
  log('🔔更新脚本开始!');
  scripts.forEach((script) => {
    $.getFile(script);
  });
  log('🔔更新脚本结束!');
}
update();
