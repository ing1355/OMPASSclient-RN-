import types from './types';

export function firstSettingToggle(toggle) {
    return {
        type: types.firstSettingToggle,
        payload: toggle
    };
}