import types from './types';

export function iosTypeToggle(toggle) {
    return {
        type: types.iosTypeToggle,
        payload: toggle
    };
}