import AsyncStorage from '@react-native-async-storage/async-storage';
import { AsyncStorageLogKey, AsyncStorageAppSettingKey } from '../Constans/ContstantValues';
import RNFetchBlob from 'rn-fetch-blob';
import { getDeviceName, getModel } from 'react-native-device-info';
import { CustomSystem } from './NativeModules';

const dirs = RNFetchBlob.fs.dirs;
export const DocumentDir = dirs.DocumentDir
export const AuthLogFileName = "authLog"
const fs = RNFetchBlob.fs
const logPath = DocumentDir + `/${AuthLogFileName}`;

export const saveDataToLogFile = async (tag, data) => {
    if(!(await fs.exists(logPath))) {
        await fs.createFile(logPath, "", "utf8")
    }
    await fs.appendFile(logPath, `[${convertFullTimeString(new Date())}] - ${tag || "no tag"} - ${JSON.stringify(data)}` + '\n\n', "utf8")
}

export const getDataByLogFile = async () => {
    if(!(await fs.exists(logPath))) return ''
    return await fs.readFile(logPath, "utf8")
}

export const clearDataLogFile = async () => {
    if((await fs.exists(logPath))) await fs.unlink(logPath)
    await fs.createFile(logPath, "", "utf8")
}

export const sendLogFileToServer = async (callback) => {
    RNFetchBlob.fetch('POST', 'https://ompass.kr:56000/log', { 'Content-Type': 'application/json' }, JSON.stringify({
        log: await getDataByLogFile(),
        alias: await getDeviceName() + ',' + getModel()
    })).then(async res => {
        CustomConsoleLog(res)
        if(res.data === "success") {
            await clearDataLogFile()
            if(callback) callback(res)
        }
    }).catch(e => {
        CustomConsoleLog(e)
    })
}

export const CustomConsoleLog = (...args) => {
    CustomSystem.LogNative("RNLog", JSON.stringify(args))
}

function AddZeroFunc(num) {
    let temp = num
    if(typeof num === 'string') {
        temp = parseInt(num)
    }
    if (temp < 10) {
        return '0' + temp;
    } else {
        return temp;
    }
}

export function convertFullTimeString(now) {
    return `${now.getFullYear()}-${AddZeroFunc(now.getMonth() + 1)}-${AddZeroFunc(now.getDate())} ${AddZeroFunc(now.getHours())}:${AddZeroFunc(now.getMinutes())}:${AddZeroFunc(now.getSeconds())}`
}

const getTimeDoubleFormat = time => {
    return time >= 10 ? time : '0' + time
}

export const getCurrentFullDateTime = (_date) => {
    const fullDate = _date ? new Date(_date) : new Date()
    const year = fullDate.getFullYear();
    const month = fullDate.getMonth() + 1;
    const date = fullDate.getDate();
    const hour = fullDate.getHours()
    const minute = fullDate.getMinutes()
    const second = fullDate.getSeconds()

    return `${year}-${getTimeDoubleFormat(month)}-${getTimeDoubleFormat(date)} ${getTimeDoubleFormat(hour)}:${getTimeDoubleFormat(minute)}:${getTimeDoubleFormat(second)}`
}

export const saveAuthLogByResult = async (type, result, authData) => {
    let logs = JSON.parse(await AsyncStorage.getItem(AsyncStorageLogKey)) || []
    let logsNum = JSON.parse(await AsyncStorage.getItem(AsyncStorageAppSettingKey)).logsNum
    const { domain, username, clientInfo } = authData || {};
    const { browser, gpu, os, osVersion, alias, uuid } = clientInfo || {}
    if (!logs.find(log => log.domain === domain)) {
        logs = logs.concat({
            domain,
            datas: [
                {
                    username: username,
                    alias,
                    uuid,
                    OS: (os || osVersion) && (os + ' ' + osVersion),
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
                if (log.datas.find(_data => alias ? (_data.alias === alias) : (_data.username === username && !_data.alias))) {
                    return {
                        ...log,
                        datas: log.datas.map(data => {
                            if (alias ? (data.alias === alias) : (data.username === username && !data.alias)) {
                                return {
                                    username: username,
                                    alias,
                                    uuid,
                                    Browser: browser,
                                    GPU: gpu,
                                    OS: (os || osVersion) && (os + ' ' + osVersion),
                                    logs: [
                                        {
                                            createdAt: getCurrentFullDateTime(),
                                            result,
                                            type
                                        }, ...data.logs.slice(0, logsNum - 1)
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
                            username: username,
                            alias,
                            uuid,
                            Browser: browser,
                            GPU: gpu,
                            OS: (os || osVersion) && (os + ' ' + osVersion),
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

export const getDataByNonce = (url, nonce, userId, successCallback, errorCallback) => {
    RNFetchBlob.config({
        trusty: true,
    })
        .fetch(
            'POST',
            url,
            {
                'Content-Type': 'application/json',
            },
            JSON.stringify(userId ? {
                nonce,
                userId
            } : {
                    nonce
                }),
        )
        .then(async (resp) => {
            const { data } = resp;
            if (successCallback) {
                try {
                    const _data = JSON.parse(data)
                    if(_data.error) {
                        if (errorCallback) errorCallback(_data.error)
                    } else {
                        successCallback(_data)
                    }
                } catch (e) {
                    if (errorCallback) errorCallback(data)
                }
            }
        })
        .catch((err) => {
            if (errorCallback) errorCallback(err.message)
        });
}

export function isJson(str) {
    try {
      if (!JSON.parse(str)) return false;
    } catch (e) {
      return false;
    }
    return true;
  }