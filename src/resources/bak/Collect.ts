import { IEnv } from "../interface/Env";

const $: IEnv = importModule('Env');

if (config.runsInAccessoryWidget) {
  if (!$.hasdata('warm-collect2')) {
    $.setdata('warm-collect2', '0');
  }
  $.setdata('warm-collect2', (parseInt($.getdata('warm-collect2')) + 1) + '');
}

const time = new Date().getHours() + ':' + new Date().getMinutes();
$.setdata('ABL-demo', time);
log('设置成功: ' + time);
// @ts-ignore
const rs = await record();
$.setdata('ABL-address', JSON.stringify(rs));

const collectWidget = new ListWidget();
collectWidget.setPadding(10, 10, 10, 10);
collectWidget.addText($.getdata('warm-collect2') + '采集: ' + time);

Script.setWidget(collectWidget);
Script.complete();

async function record() {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  Location.setAccuracyToHundredMeters();
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return await Location.current();
}
