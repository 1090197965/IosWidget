const rsConfig = {
  target: '',
  url: '',
  control: '',
}
let rs = 1;
if (config.runsInApp) {
  const notice = new Alert();
  notice.addAction('DEV环境');
  notice.addAction('正式环境');
  notice.addCancelAction('取消操作');
  rs = await notice.presentSheet();
}

switch (rs) {
  case -1:
    return;
  case 0:
    rsConfig.target = 'qp';
    rsConfig.url = 'http://10.81.3.113:9000';
    rsConfig.control = 'http://10.81.3.113:99';
    break;
  case 1:
    rsConfig.target = 'amiang';
    rsConfig.url = 'https://nas.qppp.top:22431';
    rsConfig.control = 'http://10.81.3.113:99';
    break;
}

module.exports = {
  driveName: 'qp',
  target: rsConfig.target,
  url: rsConfig.url,
  control: rsConfig.control,
};
