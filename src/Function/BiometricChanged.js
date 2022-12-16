import AsyncStorage from '@react-native-async-storage/async-storage';
import { AsyncStorageAuthenticationsKey, AsyncStorageCurrentAuthKey } from '../Constans/ContstantValues';
import { modalOpen_ref } from "../Pages/Home";
import { navigationRef } from "../Route/Router";

export async function check_auth_info(detected, props) {
    const auth_info = await AsyncStorage.getItem(AsyncStorageAuthenticationsKey);
    const currentAuth = await AsyncStorage.getItem(AsyncStorageCurrentAuthKey);
    if (currentAuth) {
        await props.changeCurrentAuth(currentAuth);
    }
    if (auth_info) {
        const { android, ios } = JSON.parse(auth_info);
        await props.auth_all(JSON.parse(auth_info));
        let count = 0;
        Object.keys(android).map(key => {
            if (android[key]) count++;
        })
        if (detected) {
            MoveSettingBiometricChange(detected, true);
        } else if (count < 2) {
            MoveSettingBiometricChange(false);
        }
    } else {
        if (detected) {
            MoveSettingBiometricChange(detected, true);
        } else {
            MoveSettingBiometricChange(false);
        }
    }
}

function MoveSettingBiometricChange(detected, toggle) {
    if (toggle) {
        modalOpen_ref.current(false);
        setTimeout(() => {
            navigationRef.current.reset({
                index: 0, routes: [{
                    name: 'Setting', params: {
                        init: detected
                    }
                }]
            });
        }, 100);
    } else {
        modalOpen_ref.current(false);
        setTimeout(() => {
            navigationRef.current.replace('Setting', { init: true });
        }, 100);
    }
}