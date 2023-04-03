import React, { useEffect, useRef, useLayoutEffect, useState } from 'react';
import {
  LogBox,
  AppState,
  Linking,
  Vibration
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
import * as RootNavigation from './src/Route/Router'
import { getDataByNonce } from './src/Function/GlobalFunction';

LogBox.ignoreAllLogs();
const i18n = new I18n()
const getToken = async () => {
  messaging().getToken().then(async token => {
    console.log('fcm token : ', token)
    await AsyncStorage.setItem(AsyncStorageFcmTokenKey, token)
  }).catch(err => {
    console.log('why get fcm token err ? : ', err)
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
  const [execute, setExecute] = useState(false);
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
    await AsyncStorage.removeItem(AsyncStoragePushDataKey)
  }

  const checkAuthenticatePushData = async (msg) => {
    isAuthenticateChecked = true
    if (msg) {
      pushCallback(msg.data.data)
    } else {
      const data = await AsyncStorage.getItem(AsyncStoragePushDataKey)
      if (data) {
        pushCallback(data)
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
    Linking.getInitialURL().then(url => {
      if (url) {
        appLinkCallback(url)
      } else {
        if (!isAuthenticateChecked) {
          checkAuthenticatePushData()
        }
      }
      AppState.addEventListener('change', async nextAppState => {
        if (nextAppState === 'active' && !isAuthenticateChecked) {
          checkAuthenticatePushData()
        }
      })
    })
    Linking.addEventListener('url', ({ url }) => {
      if (url) appLinkCallback(url)
    })
    messaging().onMessage(message => {
      console.log('fore Fcm : ', message)
      if (message) {
        displayNotification(message);
      }
    })
    notifee.onForegroundEvent(async ({ type, detail }) => {
      const { notification, pressAction } = detail
      if (type === EventType.DELIVERED) {
        if (!isAuthenticateChecked) {
          checkAuthenticatePushData(notification)
        }
      }
    });
    return () => {
      // RNLocalize.removeEventListener('change', handleLocalizationChange);
      // BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    }
  }, [])

  const appLinkCallback = (url) => {
    isAuthenticateChecked = true
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
      isAuthenticateChecked = false
    }, (err) => {
      isAuthenticateChecked = false
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