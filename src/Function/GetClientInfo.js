import { Platform } from 'react-native';
import { getDeviceId, getDeviceName, getSystemVersion, getVersion } from 'react-native-device-info';

export const GetClientInfo = async (info) => {
    info = info || {}
    return JSON.stringify({...info, appVersion: getVersion(), mobileOSVersion: getSystemVersion(), mobileModel: Platform.OS === 'ios' ? getDeviceId() : await getDeviceName(), mobileOS: Platform.OS})
}