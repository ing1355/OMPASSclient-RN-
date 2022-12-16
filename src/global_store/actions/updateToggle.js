import types from './types';

export function updateToggle(toggle) {
    return {
        type: types.updateToggle,
        payload: toggle
    };
}