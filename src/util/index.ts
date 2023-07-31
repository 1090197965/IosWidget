export function getStatusImg() {
  return 'https://ztn.feishu.cn/wiki/NLCnwjYyBiYctTkxIhHcwVq1nlb';
}

export function setBeiJinDate(date: Date) {
  const timeOffect = new Date().getTimezoneOffset() / 60 + 8;
  date.setHours(date.getHours() + timeOffect);
}

export function getBeiJinNowDate() {
  const date = new Date();
  setBeiJinDate(date);
  return date;
}
