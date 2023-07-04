// @ts-ignore
import axios, { AxiosResponse } from "axios";
import { IAppRecordData, IAppSendMessage, IHomeInfos, IResponse } from "../interface/scriptable.interface";

const instance = axios.create({
    withCredentials: true,
    timeout: 1000 * 60,
    baseURL: import.meta.env.VITE_API_URL,
    headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    }
})
export default {
    getHomeInfos(data): Promise<AxiosResponse<IResponse<IHomeInfos>>> {
        return instance.post('/scriptable/infos', data)
    },
    sendMessage(data:IAppSendMessage): Promise<AxiosResponse<IResponse<IAppRecordData>>> {
        return instance.post('/scriptable/sendMessage', data)
    }
};
