import { IRecordData } from '../interface/widget.interface';

interface IEventDate {
  type: string;
  date: string;
  note: string;
  handle: (IRecordData) => IRecordData;
}

const eventList: IEventDate[] = [
  {
    type: 'year',
    date: '8/2',
    note: '新历生日',
    handle: (data: IRecordData) => {
      data.backgroundImageSkin = 'happyBirthday';
      data.addressIconSkin = 'happyBirthdayHead';
      data.addressIcon = 'merge';
      return data;
    },
  },
  {
    type: 'full',
    date: '2023/8/7',
    note: '农历生日',
    handle: (data: IRecordData) => {
      data.backgroundImageSkin = 'happyBirthday';
      data.addressIconSkin = 'happyBirthdayHead';
      data.addressIcon = 'merge';
      return data;
    },
  },
];

export default eventList;
