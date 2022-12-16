import types from './types';

export function changeNotificationToggle(toggle) {
    return {
        type: types.changeNotificationToggle,
        payload: toggle
    };
}

export function changeNotificationMsg(msg) {
    return {
        type: types.changeNotificationToggle,
        payload: msg
    };
}

export function changeNotificationTitle(title) {
    return {
        type: types.changeNtoficiationTitle,
        payload: title
    }
}

export function changeNotificationCallback(callback) {
    return {
        type: types.changeNotificatioCallback,
        payload: callback
    }
}