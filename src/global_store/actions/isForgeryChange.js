import types from './types';

export function isForgeryChange(toggle) {
    return {
        type: types.isForgeryChange,
        payload: toggle
    };
}