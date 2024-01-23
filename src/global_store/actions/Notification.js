import types from './types';

export function changeNotificationToggle(toggle) {
    return {
        type: types.changeNotificationToggle,
        payload: toggle
    };
}