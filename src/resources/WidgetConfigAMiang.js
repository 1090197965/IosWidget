const getConfig = async() => {
  return {
    driveName: 'amiang',
    target: 'qp',
    url: 'https://nas.qppp.top:22431',
    control: 'https://nas.qppp.top:22432/',
    debug: false,
    suffix: '',
  }
}

module.exports = {
  getConfig,
};
