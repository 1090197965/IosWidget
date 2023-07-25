import { IRecordData } from '../interface/widget.interface';

export function compareDates(
  date1: string | Date,
  date2: string | Date,
): boolean {
  const parseDate = (date: string | Date): Date => {
    if (typeof date === 'string') {
      return new Date(date);
    }
    return date;
  };

  const parsedDate1 = parseDate(date1);
  const parsedDate2 = parseDate(date2);

  const year1 = parsedDate1.getFullYear();
  const month1 = parsedDate1.getMonth();
  const day1 = parsedDate1.getDate();

  const year2 = parsedDate2.getFullYear();
  const month2 = parsedDate2.getMonth();
  const day2 = parsedDate2.getDate();

  return year1 === year2 && month1 === month2 && day1 === day2;
}

export function getStatusImg() {
  return 'https://ztn.feishu.cn/wiki/NLCnwjYyBiYctTkxIhHcwVq1nlb';
}

export function getDwellTimeMinutes(data: IRecordData, list: IRecordData[]) {
  const longitudeTolerate = 0.002;
  const latitudeTolerate = 0.0026;
  const longitude = data.current100.longitude; // 114.05844
  const latitude = data.current100.latitude; // 22.64547
  let infoRecent: IRecordData;
  let isEnd = false;

  list
    .slice()
    .reverse()
    .forEach((item) => {
      const longitudeDiff = Math.abs(longitude - item.current100.longitude);
      const latitudeDiff = Math.abs(latitude - item.current100.latitude);
      if (
        !isEnd &&
        longitudeDiff <= longitudeTolerate &&
        latitudeDiff <= latitudeTolerate
      ) {
        infoRecent = item;
      } else {
        isEnd = true;
      }
    });

  if (infoRecent) {
    return (
      (new Date(data.time).getTime() - new Date(infoRecent.time).getTime()) /
      1000 /
      60
    );
  } else {
    return 0;
  }
}
