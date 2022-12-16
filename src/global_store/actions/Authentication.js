import types from './types';

export function settingAuthentications(obj) {
    return {
        type: types.settingAuthentication,
        payload: obj
    }
}

export function settingAllAuthentications(obj) {
    return {
        type: types.settingAllAuthentication,
        payload: obj
    }
}

export function settingCurrentAuth(auth) {
    return {
        type: types.settingCurrentAuth,
        payload: auth
    }
}