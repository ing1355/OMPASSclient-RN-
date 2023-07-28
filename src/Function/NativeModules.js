import { NativeModules, NativeEventEmitter } from "react-native"

export const getToken = NativeModules.FCMFunctions.getToken

export const CustomNativeEventEmitter = new NativeEventEmitter(NativeModules.EventEmitter)