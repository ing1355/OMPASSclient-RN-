import types from './types';

export function loadingToggle(toggle) {
    return {
        type: types.loadingToggle,
        payload: toggle
    };
}