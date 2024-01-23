import React, { useRef, useLayoutEffect, useState, useEffect } from 'react';
import {
  LogBox,
  Linking,
  Vibration
} from 'react-native';
import 'react-native-gesture-handler';
import Routes from './src/Route/Routes';
import * as RNLocalize from 'react-native-localize';
import memoize from 'lodash.memoize';
import FidoAuthentication from './src/Function/FidoAuthentication'
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loading from './src/Components/Loading'
import { push_function } from './src/Function/PushFunctions';
import { I18n } from 'i18n-js';
import { AsyncStorageFcmTokenKey } from './src/Constans/ContstantValues';
import * as RootNavigation from './src/Route/Router'
import { convertFullTimeString, getDataByNonce, saveDataToLogFile } from './src/Function/GlobalFunction';
import { CustomNativeEventEmitter, CustomSystem, getToken } from './src/Function/NativeModules';
import { Platform } from 'react-native';
import { silencePush, silencePushClear } from '.';

LogBox.ignoreAllLogs();
const i18n = new I18n()

const _getToken = async (callback) => {
  let fcmToken = await AsyncStorage.getItem(AsyncStorageFcmTokenKey);
  console.log('token : ', fcmToken)
  if (!fcmToken) {
    fcmToken = await getToken();
    if (fcmToken) {
      await AsyncStorage.setItem(AsyncStorageFcmTokenKey, fcmToken);
    }
  } else {
    let new_token = await getToken();
    if (new_token !== fcmToken) {
      await AsyncStorage.setItem(AsyncStorageFcmTokenKey, new_token);
    }
  }
  console.log('token2 : ', fcmToken)
  if (callback) callback()
};

CustomNativeEventEmitter.addListener('newToken', async (token) => {
  await AsyncStorage.setItem(AsyncStorageFcmTokenKey, token);
})

export const translate = memoize(
  (key, config) => i18n.t(key, config),
  (key, config) => (config ? key + JSON.stringify(config) : key),
);

const translationGetters = {
  en: () => require('./src/locale/en.json'),
  ko: () => require('./src/locale/kr.json'),
};

const setI18nConfig = () => {
  const { languageCode } = RNLocalize.getLocales()[0];
  translate.cache.clear();
  i18n.translations = { [languageCode]: translationGetters[languageCode]() };
  i18n.locale = languageCode;
};

setI18nConfig();

const initTempData = {
  clientInfo: {
    browser: '',
    gpu: '',
    os: '',
    osVersion: '',
    name: '',
    ip: '',
    location: ''
  }
}

const App = (props) => {
  const [push_result_temp, setPush_result_temp] = useState(initTempData)
  const [fidoType, setFidoType] = useState("auth")
  
  const tempRef = useRef({})

  function handleBackPress() {
    return true;
  }

  useLayoutEffect(() => {
    tempRef.current = push_result_temp
  },[push_result_temp])

  const pushCallback = async (data) => {
    silencePushClear()
    push_function(data, res => {
      const result = JSON.parse(res)
      const currentTime = new Date().getTime()
      console.log(`Server Expire Time : ${convertFullTimeString(new Date(result.sessionExpirationTime))}`)
      saveDataToLogFile("Push Callback Time1", `Server Expire Time : ${convertFullTimeString(new Date(result.sessionExpirationTime))}`)
      if(result.mId) saveDataToLogFile("Push Callback Time2", `Message Id Time : ${convertFullTimeString(new Date(Number(result.mId.split(':')[1].split('%')[0].slice(0,-3))))}`)
      if(tempRef.current.accessKey) saveDataToLogFile("Push Callback TempData", tempRef.current) 
      saveDataToLogFile("Push Callback Data", result)
      if(!result.sessionExpirationTime || (result.sessionExpirationTime - currentTime) > 0) {
        if(result.accessKey !== tempRef.current.accessKey) {
          setFidoType('auth')
          Vibration.vibrate()
          setPush_result_temp(result)
        }
      }
    })
  }

  const checkAuthenticatePushData = async (data) => {
    if (data) {
      pushCallback(data)
    }
  }

  useEffect(() => {
    if(Platform.OS === 'ios') {
      const pendingPush = CustomSystem.checkPendingPush()
      if(pendingPush) checkAuthenticatePushData(pendingPush.data)
      // saveDataToLogFile("iOS Opened Push", pendingPush.data)
    } else {
      if(props && props.data) {
        saveDataToLogFile("Android Opened Push1", props.data)
        checkAuthenticatePushData(props.data)
      }
    }
    if(silencePush) {
      checkAuthenticatePushData(silencePush)
    }
    // const back_handle = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    const handleLocalizationChange = () => {
      setI18nConfig();
    };
    _getToken()
    saveDataToLogFile("register event listener pushEvent")
    CustomNativeEventEmitter.addListener('pushEvent', data => {
      saveDataToLogFile("Received PushEvent", Platform.OS === 'android' ? data : data.data)
      if(Platform.OS === 'ios') CustomSystem.cancelPendingPush()
      checkAuthenticatePushData(Platform.OS === 'android' ? data : data.data)
    })
    // CustomNativeEventEmitter.addListener("pushOpenedApp", (data) => {
    //   saveDataToLogFile("Android Opened Push2", data)
    //   checkAuthenticatePushData(data)
    // })
    RNLocalize.addEventListener('change', handleLocalizationChange);
    Linking.getInitialURL().then(url => {
      if (url) {
        appLinkCallback(url)
      }
    })
    Linking.addEventListener('url', ({ url }) => {
      if (url) appLinkCallback(url)
    })
  
    return () => {
      // RNLocalize.removeEventListener('change', handleLocalizationChange);
      // BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    }
  }, [])

  const appLinkCallback = (url) => {
    let regex = /[?&]([^=#]+)=([^&#]*)/g,
    params = {},
    match
    while ((match = regex.exec(url))) {
      params[match[1]] = match[2]
    }
    const type = params.url.includes('auth') ? 'OMPASSAuth' : 'OMPASSRegist'
    saveDataToLogFile("AppLink Callback")
    getDataByNonce(params.url, params.nonce, params.userId, (data) => {
      if (data.error) {
        saveDataToLogFile("getDataByNonce Fail(params)", params)
        RootNavigation.navigate('Auth_Fail', {
          type,
          reason: translate('CODE002'),
        });
      } else {
        saveDataToLogFile("getDataByNonce Success(params)", params)
        saveDataToLogFile("getDataByNonce Success(Response Json)", data)
        if(data.accessKey !== tempRef.current.accessKey) {
          Vibration.vibrate()
          setPush_result_temp(data)
        }
      }
    }, (err) => {
      console.log(err)
      saveDataToLogFile("getDataByNonce Fail(catch)", err)
      RootNavigation.navigate('Auth_Fail', {
        type,
        reason: err && (err.error || err),
      });
    })
  }
  
  return (
    <>
      <Loading />
      <Routes />
      <FidoAuthentication type={fidoType} tempAuthData={push_result_temp} initCallback={() => {
        setPush_result_temp(initTempData)
      }}/>
    </>
  );
};

export default App;