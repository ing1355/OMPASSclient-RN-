import * as loadingAction from './loadingToggle';
import * as AuthAction from './Authentication';
import * as NotificationAction from './Notification';
import * as iosTypeAction from './iosTypeToggle';
import * as updateToggle from './updateToggle';
import * as isRootChange from './isRootChange';
import * as isForgeryChange from './isForgeryChange';
import * as usbConnectedChange from './usbConnectedChange';
import * as firstSettingToggle from './firstSettingToggle';
import * as settingChange from './settingChange';

const ActionCreators = Object.assign({}, loadingAction, AuthAction, NotificationAction, iosTypeAction, updateToggle, isRootChange, isForgeryChange, usbConnectedChange, firstSettingToggle, settingChange);

export default ActionCreators;
