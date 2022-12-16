import types from './types';

export function usbConnectedChange(toggle) {
    return {
        type: types.usbConnectedChange,
        payload: toggle
    };
}