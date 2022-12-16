import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules } from "react-native";
import { AsyncStorageIosTypeKey } from '../Constans/ContstantValues';

export async function CheckIosType(callback) {
    const { biometricType } = NativeModules.webAuthn;
    if (!await AsyncStorage.getItem(AsyncStorageIosTypeKey)) {
        biometricType(async (result) => {
            await AsyncStorage.setItem(AsyncStorageIosTypeKey, result);
            callback();
        })
    }
}