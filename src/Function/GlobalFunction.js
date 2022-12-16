import AsyncStorage from '@react-native-async-storage/async-storage';
import { AsyncStorageLogKey, AsyncStorageAppSettingKey } from '../Constans/ContstantValues';

const getTimeDoubleFormat = time => {
    return time >= 10 ? time : '0' + time
}

export const getCurrentFullDateTime = () => {
    const fullDate = new Date()
    const year = fullDate.getFullYear();
    const month = fullDate.getMonth() + 1;
    const date = fullDate.getDate();
    const hour = fullDate.getHours()
    const minute = fullDate.getMinutes()
    const second = fullDate.getSeconds()

    return `${year}-${getTimeDoubleFormat(month)}-${getTimeDoubleFormat(date)} ${getTimeDoubleFormat(hour)}:${getTimeDoubleFormat(minute)}:${getTimeDoubleFormat(second)}`
}

export const saveAuthLogByResult = async (type, result, authData) => {
    console.log('here??')
    let logs = JSON.parse(await AsyncStorage.getItem(AsyncStorageLogKey))
    console.log(logs)
    let logsNum = JSON.parse(await AsyncStorage.getItem(AsyncStorageAppSettingKey)).logsNum
    const { domain, username, clientInfo } = authData || {};
    const { browser, gpu, os, osVersion } = clientInfo
    if (!logs.find(log => log.domain === domain)) {
        logs = logs.concat({
            domain,
            icon: "",
            datas: [
                {
                    username,
                    OS: os + ' ' + osVersion,
                    Browser: browser,
                    GPU: gpu,
                    logs: [
                        {
                            createdAt: getCurrentFullDateTime(),
                            result: true,
                            type
                        }
                    ]
                }
            ]
        })
    } else {
        logs = logs.map(log => {
            if (log.domain === domain) {
                if (log.datas.find(_data => _data.username === username)) {
                    return {
                        ...log,
                        datas: log.datas.map(data => {
                            if (data.username === username) {
                                return {
                                    username,
                                    Browser: browser,
                                    GPU: gpu,
                                    OS: os + ' ' + osVersion,
                                    logs: [
                                        {
                                            createdAt: getCurrentFullDateTime(),
                                            result,
                                            type
                                        }, ...data.logs.slice(0,logsNum - 1)
                                    ]
                                }
                            } else {
                                return data
                            }
                        })
                    }
                } else {
                    return {
                        ...log,
                        datas: log.datas.concat({
                            username,
                            Browser: browser,
                            GPU: gpu,
                            OS: os + ' ' + osVersion,
                            logs: [
                                {
                                    createdAt: getCurrentFullDateTime(),
                                    result,
                                    type
                                }
                            ]
                        })
                    }
                }
            } else {
                return log
            }
        })
    }
    
    await AsyncStorage.setItem(AsyncStorageLogKey, JSON.stringify(logs))
}