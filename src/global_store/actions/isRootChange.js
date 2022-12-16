import types from './types';

export function isRootChange(toggle) {
    return {
        type: types.isRootChange,
        payload: toggle
    };
}