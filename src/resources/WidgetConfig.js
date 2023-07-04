const getConfig = async() => {
  const rsConfig = {
    target: '',
    url: '',
    control: '',
    suffix: '',
  }
  let rs = 1;
  if (config.runsInApp && args.widgetParameter !== 'widget') {
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
      rsConfig.control = 'http://10.81.3.113:8888';
      rsConfig.suffix = '_Dev';
      break;
    case 1:
    default:
      rsConfig.target = 'amiang';
      rsConfig.url = 'https://nas.qppp.top:22431';
      rsConfig.control = 'https://nas.qppp.top:22432/';
      rsConfig.suffix = '';
      break;
  }
  log('获取配置')
  log(rsConfig)

  return {
    driveName: 'qp',
    target: rsConfig.target,
    url: rsConfig.url,
    control: rsConfig.control,
    suffix: rsConfig.suffix
  }
}

module.exports = {
  getConfig,
};
