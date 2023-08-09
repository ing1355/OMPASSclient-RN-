import React, { useRef, useLayoutEffect, useState, useEffect } from 'react';
import {
  LogBox,
  AppState,
  Linking,
  Vibration,
  NativeModules
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
import { getCurrentFullDateTime, getDataByNonce } from './src/Function/GlobalFunction';
import { CustomNativeEventEmitter, getToken } from './src/Function/NativeModules';
import { Platform } from 'react-native';

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
    push_function(data, res => {
      const result = JSON.parse(res)
      if(!result.sessionExpirationTime || result.sessionExpirationTime - new Date().getTime() > 0) {
        if(result.accessKey !== tempRef.current.accessKey) {
          setFidoType('auth')
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

  useLayoutEffect(() => {
    if(Platform.OS === 'ios') {
      const pendingPush = NativeModules.CustomSystem.checkPendingPush()
      if(pendingPush) checkAuthenticatePushData(pendingPush.data)
    } else {
      if(props && props.data) checkAuthenticatePushData(props.data)
    }
    // const back_handle = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    const handleLocalizationChange = () => {
      setI18nConfig();
    };
    _getToken()
    CustomNativeEventEmitter.addListener('pushEvent', data => {
      if(Platform.OS === 'ios') NativeModules.CustomSystem.cancelPendingPush()
      checkAuthenticatePushData(Platform.OS === 'android' ? data : data.data)
    })
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
    
    getDataByNonce(params.url, params.nonce, params.userId, (data) => {
      if (data.error) {
        Vibration.vibrate()
        RootNavigation.navigate('Auth_Fail', {
          type,
          reason: translate('CODE002'),
        });
      } else {
        if(data.accessKey !== tempRef.current.accessKey) {
          setPush_result_temp(data)
        }
      }
    }, (err) => {
      console.log(err)
      Vibration.vibrate()
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