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
