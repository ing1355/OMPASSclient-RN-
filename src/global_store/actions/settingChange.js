import types from "./types"

export function settingChange(settings) {
    return {
        type: types.settingChange,
        payload: settings
    }
}