import types from './types';

export function isDeprecatedChange(toggle) {
    return {
        type: types.isDeprecatedChange,
        payload: toggle
    };
}