import axios, { AxiosResponse } from "axios";
import { IHomeInfos, IResponse, IWidgetRecordData } from "../interface/scriptable.interface";

const instance = axios.create({
    withCredentials: true,
    timeout: 1000 * 60,
    baseURL: 'http://10.81.3.113:9000',
    headers: {
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
    }
})
export default {
    getHomeInfos(): Promise<AxiosResponse<IResponse<IHomeInfos>>> {
        return instance.get('/scriptable/infos')
    }
};
