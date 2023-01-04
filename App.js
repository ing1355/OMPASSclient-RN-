import React, { useEffect, useLayoutEffect, useState } from 'react';
import {
  LogBox,
  AppState,
  Linking
} from 'react-native';
import 'react-native-gesture-handler';
import Routes from './src/Route/Routes';
import * as RNLocalize from 'react-native-localize';
import memoize from 'lodash.memoize';
import messaging from '@react-native-firebase/messaging';
import FidoAuthentication from './src/Function/FidoAuthentication'
import AsyncStorage from '@react-native-async-storage/async-storage';
import Loading from './src/Components/Loading'
import { push_function } from './src/Function/PushFunctions';
import { I18n } from 'i18n-js';
import { displayNotification } from './src/Function/displayNotification';
import { AsyncStorageFcmTokenKey, AsyncStoragePushDataKey } from './src/Constans/ContstantValues';
import notifee, { EventType } from '@notifee/react-native'
import dynamicLink from '@react-native-firebase/dynamic-links'
import { getDataByNonce } from './src/Function/GlobalFunction';

LogBox.ignoreAllLogs();
const i18n = new I18n()
const getToken = async () => {
  messaging().getToken().then(async token => {
    console.log('fcm token : ', token)
    await AsyncStorage.setItem(AsyncStorageFcmTokenKey, token)
  }).catch(err => {
    console.log('why err ? : ', err)
  })
}

getToken()

messaging().onTokenRefresh(async token => {
  console.log('refresh token : ', token)
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

export let isAuthenticateChecked = false;

export function isAuthenticateCheckedToggle(checked) {
  isAuthenticateChecked = checked
}

const App = (props) => {
  const [execute, setExecute] = useState(false);
  const [fidoType, setFidoType] = useState("auth")
  const [push_result, setPush_result] = useState({
    clientInfo: {
      browser: null,
      gpu: null,
      os: null,
      osVersion: null,
      name: null
    }
  });

  function handleBackPress() {
    return true;
  }

  const pushCallback = async (data) => {
    await notifee.cancelAllNotifications()
    console.log('pushCallback', data)
    push_function(data, res => {
      setFidoType('auth')
      setPush_result(JSON.parse(res));
      setExecute(true);
    })
  }

  const checkAuthenticatePushData = async (msg) => {
    isAuthenticateChecked = true
    if (msg) {
      pushCallback(msg.data.data)
    } else {
      const data = await AsyncStorage.getItem(AsyncStoragePushDataKey)
      if (data) {
        pushCallback(data)
        await AsyncStorage.removeItem(AsyncStoragePushDataKey)
      }
    }
    isAuthenticateChecked = false;
  }

  useLayoutEffect(() => {
    // const back_handle = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    const handleLocalizationChange = () => {
      setI18nConfig();
    };
    RNLocalize.addEventListener('change', handleLocalizationChange);
    if (!isAuthenticateChecked) checkAuthenticatePushData()
    notifee.onForegroundEvent(async ({ type, detail }) => {
      const { notification, pressAction } = detail
      if (type === EventType.DELIVERED) {
        console.log('1', type, detail)
        if (!isAuthenticateChecked) checkAuthenticatePushData(notification)
      }
    });
    messaging().onMessage(message => {
      console.log(message)
      if (message) {
        displayNotification(message);
      }
    })
    AppState.addEventListener('change', nextAppState => {
      if (nextAppState === 'active' && !isAuthenticateChecked) checkAuthenticatePushData()
    })
    return () => {
      // RNLocalize.removeEventListener('change', handleLocalizationChange);
      // BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    }
  }, [])

  const appLinkCallback = (url) => {
    console.log(url)
    let regex = /[?&]([^=#]+)=([^&#]*)/g,
      params = {},
      match
    while ((match = regex.exec(url))) {
      params[match[1]] = match[2]
    }
    console.log(params)
    getDataByNonce(params.url, params.nonce, null, (data) => {
      setPush_result(data)
      setExecute(true)
    })
  }

  useEffect(() => {
    Linking.getInitialURL().then(url => {
      if(url) appLinkCallback(url)
    })
    Linking.addEventListener('url', ({url}) => {
      console.log(url)
      appLinkCallback(url)
    })
    // setTimeout(() => {
    //   NativeModules.CustomSystem.ExitApp()
    // }, 5000);
  }, [])

  return (
    <>
      <Loading />
      <Routes />
      <FidoAuthentication type={fidoType} authData={push_result} setAuthData={setPush_result} execute={execute} setExecute={setExecute} />
    </>
  );
};

export default App;