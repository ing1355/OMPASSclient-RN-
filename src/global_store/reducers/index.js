import {combineReducers} from 'redux';
import toggleReducer from './toggleReducer';
import authReducer from './authReducer';
import currentAuthReducer from './currentAuthReducer';
import NotificationReducer from './NotificationReducer';
import IosTypeReducer from './IosTypeReducer';
import updateReducer from './updateReducer';
import rootReducer from './rootReducer';
import usbCheckReducer from './usbCheckReducer';
import forgeryReducer from './forgeryReducer';
import firstSettingReducer from './firstSettingReducer';
import settingReducer from './settingReducer';
import deprecatedReducer from './deprecatedReducer';

export default combineReducers({
    isLoading: toggleReducer,
    Authentications: authReducer,
    currentAuth: currentAuthReducer,
    notificationToggle: NotificationReducer,
    iosType: IosTypeReducer,
    needUpdate: updateReducer,
    isRoot: rootReducer,
    usbConnected: usbCheckReducer,
    isForgery: forgeryReducer,
    firstSetting: firstSettingReducer,
    appSettings: settingReducer,
    isDeprecated: deprecatedReducer
})