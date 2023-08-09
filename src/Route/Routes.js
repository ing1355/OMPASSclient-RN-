import React, { useEffect, useRef, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { navigationRef } from './Router';
import {
  Home,
  Logs,
  QrCode,
  Auth_Complete,
  Auth_Ing,
  Setting,
  Auth_Fail,
  Pin,
  Pattern,
  Biometric,
  Fingerprint,
  Face,
  AppSetting,
  LogsNum,
  OTP
} from '../Pages';
import { createStackNavigator } from '@react-navigation/stack';
import { connect, useDispatch, useSelector } from 'react-redux';
import ActionCreators from '../global_store/actions';
import { CustomConfirmModal, CustomNotification } from '../Components/CustomAlert';
import { Text, Platform, NativeModules, DeviceEventEmitter, AppState } from 'react-native';
import SplashScreen from 'react-native-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translate } from '../../App';
import { CheckIosType } from '../Function/CheckIosType';
import { Linking } from 'react-native';
import JailMonkey from 'jail-monkey'
import { initSecurity } from '../Auth/Security';
import { AuthenticationsConst } from '../Constans/Authentications';
import { I18n } from 'i18n-js';
import NetInfo from '@react-native-community/netinfo';
import CustomStatusBar from './CustomStatusBar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AsyncStorageAppSettingKey, AsyncStorageAuthenticationsKey, AsyncStorageCurrentAuthKey, AsyncStorageInitSecurityKey, AsyncStorageIosTypeKey, AsyncStorageLogKey } from '../Constans/ContstantValues';
import { settingChange } from '../global_store/actions/settingChange';
import { CheckPermission } from '../Components/CheckPermissions';
import { ENVIRONMENT } from '@env'

const isDev = ENVIRONMENT === 'dev'
console.log('dev : ' ,isDev)
const Stack = createStackNavigator();

const Routes = ({ isDeprecated, isDeprecatedChange, firstSetting, setFirstSetting, iosTypeToggle, needUpdate, updateToggle, isForgeryChange, isRootChange, isRoot, isForgery, usbConnected, usbConnectedChange, changeCurrentAuth, auth_all, Authentications }) => {
  const [iosType, setIosType] = useState('fingerprint');
  const [serverError, setServerError] = useState(false);
  const [networkError, setNetworkError] = useState(false);
  const [inAppError, setInAppError] = useState(false);
  const [initComplete, setInitComplete] = useState(false);
  const routeNameRef = useRef(null);
  const { appSettings } = useSelector(state => ({
    appSettings: state.appSettings
  }))
  const dispatch = useDispatch()
  // const netInfo = useNetInfo();

  const LinkToStore = () => {
    if (Platform.OS === 'android') Linking.openURL("market://details?id=kr.omsecurity.ompass")
    else {
      const i18n = new I18n()
      const locale = i18n.locale || i18n.defaultLocale
      if (locale === 'ko') Linking.openURL("https://apps.apple.com/kr/app/%EC%9B%90%EB%AA%A8%EC%96%B4%ED%8C%A8%EC%8A%A4-ompass/id1547587526?mt=8")
      else Linking.openURL("https://apps.apple.com/us/app/%EC%9B%90%EB%AA%A8%EC%96%B4%ED%8C%A8%EC%8A%A4-ompass/id1547587526?mt=8")
    }
  }

  const StackContainer = <Stack.Navigator
    initialRouteName='HOME'
    // initialRouteName='Auth_Complete'
    // initialRouteName='Auth_Fail'
    screenOptions={{ headerShown: false }}>
    <Stack.Screen name="HOME" component={Home} />
    <Stack.Screen name="Logs" component={Logs} />
    <Stack.Screen name="QrCode" component={QrCode} />
    <Stack.Screen name="Auth_Ing" options={{ gestureEnabled: false }} component={Auth_Ing} />
    <Stack.Screen name="Auth_Complete" component={Auth_Complete} />
    <Stack.Screen name="Auth_Fail" component={Auth_Fail} />
    <Stack.Screen name="OTP" component={OTP} />
    <Stack.Screen name="Setting" options={{
      gestureEnabled: Object.keys(Authentications).filter(key => {
        return Authentications[key]
      }).length > 1 ? true : false
    }} component={Setting} />
    <Stack.Screen name="AppSetting" component={AppSetting} />
    <Stack.Screen name="LogsNum" component={LogsNum} />
    <Stack.Screen name="Pin" component={Pin} />
    <Stack.Screen name="Pattern" component={Pattern} />
    <Stack.Screen name="Biometrics" component={Platform.OS === 'android' ? Biometric : (iosType === 'face' ? Face : Fingerprint)} />
  </Stack.Navigator>

  const customExitApp = (noTimeOut) => {
    // if(Platform.OS === 'android') DeviceEventEmitter.removeAllListeners('isUsbConnectedEvent');
    if (!noTimeOut) {
      setTimeout(() => {
        NativeModules.CustomSystem.ExitApp();
      }, 5000);
    } else {
      NativeModules.CustomSystem.ExitApp();
    }

  }

  const firstSettingFunc = async () => {
    if (!await AsyncStorage.getItem(AsyncStorageInitSecurityKey)) {
      await AsyncStorage.setItem(AsyncStorageLogKey, JSON.stringify([]))
      setTimeout(() => {
        initSecurity(async () => {
          await AsyncStorage.setItem(AsyncStorageInitSecurityKey, "true");
          auth_all({ ...AuthenticationsConst });
          await AsyncStorage.setItem(AsyncStorageAuthenticationsKey, JSON.stringify({ ...AuthenticationsConst }), (err) => {
            console.log(err);
          });
          changeCurrentAuth("");
          await AsyncStorage.setItem(AsyncStorageCurrentAuthKey, "");
          setInitComplete(true)
          firstInit();
        })
      }, 10);
    } else {
      firstInit();
    }
  }

  const firstInit = () => {
    if (Platform.OS === 'android') {
      setTimeout(() => {
        SplashScreen.hide();
      }, 10);
    } else {
      const nowType = async () => {
        if (!await AsyncStorage.getItem(AsyncStorageIosTypeKey)) {
          CheckIosType(getType);
        } else {
          getType();
        }
      }
      nowType();
      setFirstSetting(true)
    }
  }

  const checkForgeryFunc = async () => {
    if ((await NetInfo.fetch()).isConnected) {
      NativeModules.checkForgery.isForgery(data => {
        let { hash, version, deprecated } = data
        if (isDev) {
          hash = true
          version = true
          deprecated = false
        }
        isDeprecatedChange({
          isDeprecated: deprecated,
          isChecked: true
        })
        if (!deprecated) {
          if (hash) {
            isForgeryChange({
              isChecked: true,
              isForgery: false
            });
            updateToggle({
              isChecked: version,
              needUpdate: !version
            });
            if (Platform.OS === 'ios') SplashScreen.hide();
            if (version) firstSettingFunc();
          } else {
            if (Platform.OS === 'android') {
              isForgeryChange({
                isChecked: true,
                isForgery: true
              });
            } else {
              isForgeryChange({
                isChecked: true,
                isForgery: false
              });
              updateToggle({
                isChecked: version,
                needUpdate: !version
              })
              if (!version) SplashScreen.hide()
            }
          }
        } else {
          SplashScreen.hide()
        }
      }, err => {
        console.log(err);
        if (err === 'Server Connection Error') setServerError(true)
        else if (err === 'Internel Error') setInAppError(true);
        if (Platform.OS === 'ios') SplashScreen.hide();
      })
    } else {
      if (Platform.OS === 'ios') SplashScreen.hide();
      // setNetworkError(true)
    }
  }

  const onStateChange = (state) => {
    const prevRouteName = routeNameRef.current;
    const curRouteName = navigationRef.current.getCurrentRoute().name;

    if (prevRouteName !== curRouteName) {
      routeNameRef.current = curRouteName;
    }
  }

  const getType = async () => {
    const iosType = await AsyncStorage.getItem(AsyncStorageIosTypeKey);
    setIosType(iosType)
    iosTypeToggle(await AsyncStorage.getItem(AsyncStorageIosTypeKey));
  }

  const checkFirstSetting = async () => {
    if (await AsyncStorage.getItem(AsyncStorageInitSecurityKey)) setFirstSetting(true);
  }

  const checkADBFuncForAndroid = (callback) => {
    NativeModules.CheckADB.isADB(adb => {
      if (isDev) adb = false
      usbConnectedChange({ isChecked: true, usbConnected: adb })
      if (!adb) {
        if (!isDev) {
          DeviceEventEmitter.addListener('isUsbConnectedEvent', (data) => {
            usbConnectedChange({ isChecked: true, usbConnected: data })
          })
        }
        if(callback) callback()
      }
    })
  }

  useEffect(() => {
    if(Platform.OS === 'android') {
      AppState.addEventListener('change', nextAppState => {
        if (nextAppState === 'active') {
          checkADBFuncForAndroid()
        } else {
          if (!isDev) DeviceEventEmitter.removeAllListeners('isUsbConnectedEvent');
        }
      })
    }
    const loadAppSetting = async () => {
      await CheckPermission('All')
      const settings = await AsyncStorage.getItem(AsyncStorageAppSettingKey)
      if (settings) {
        dispatch(settingChange({
          ...appSettings,
          ...JSON.parse(settings)
        }))
      } else {
        await AsyncStorage.setItem(AsyncStorageAppSettingKey, JSON.stringify(appSettings))
      }
    }
    checkFirstSetting()
    loadAppSetting()
    const isJailBroken = isDev ? false : JailMonkey.isJailBroken();
    isRootChange({
      isChecked: true,
      isRoot: isJailBroken
    })
    if (!isJailBroken) {
      if (Platform.OS === 'android') {
        checkADBFuncForAndroid(checkForgeryFunc)
      } else {
        JailMonkey.isDebuggedMode().then(res => {
          if (isDev) res = false
          if (res) {
            SplashScreen.hide();
          } else {
            checkForgeryFunc();
          }
          usbConnectedChange({ isChecked: true, usbConnected: res })
        })
      }
    } else if (isJailBroken && Platform.OS === 'ios') {
      SplashScreen.hide();
    }
  }, [])

  return (
    <>
      <SafeAreaProvider>
        <CustomStatusBar navigationRef={navigationRef} />
        <NavigationContainer ref={navigationRef} onStateChange={onStateChange}>
          {StackContainer}
        </NavigationContainer>
        {Platform.OS === 'android' && <CustomNotification
          title={translate("first_setting_title")}
          msg={
            !initComplete ? <>
              <Text style={{ textAlign: 'center' }}>
                {translate("first_setting_msg_1")}
              </Text>
              <Text style={{ textAlign: 'center' }}>
                {translate("first_setting_msg_2")}
              </Text>
              <Text style={{ textAlign: 'center' }}>
                {translate("first_setting_msg_3")}
              </Text>
            </> : <>
              <Text style={{ textAlign: 'center' }}>
                {translate("first_setting_msg_4")}
              </Text>
              <Text style={{ textAlign: 'center' }}>
                {translate("first_setting_msg_5")}
              </Text>
            </>
          }
          modalClose={() => {
            setFirstSetting(true)
          }}
          noConfirm={!initComplete}
          modalOpen={!firstSetting && isRoot.isChecked && isForgery.isChecked && usbConnected.isChecked && needUpdate.isChecked}
        />}
        <CustomNotification
          title={translate("in_app_error_title")}
          confirm_style={{ backgroundColor: '#666666' }}
          onLayout={() => {
            customExitApp();
          }}
          msg={
            <>
              <Text style={{ textAlign: 'center' }}>
                {translate("in_app_error_msg_1")}
              </Text>
              <Text style={{ textAlign: 'center' }}>
                {translate("in_app_error_msg_2")}
              </Text>
            </>
          }
          modalOpen={inAppError}
          noConfirm
        />
        <CustomConfirmModal
          title={translate("needs_update_app")}
          confirm_style={{ backgroundColor: '#666666' }}
          msg={
            <>
              <Text style={{ textAlign: 'center' }}>
                {translate("needs_update_app_msg_1")}
              </Text>
              <Text style={{ textAlign: 'center' }}>
                {translate("needs_update_app_msg_2")}
              </Text>
            </>
          }
          modalOpen={needUpdate.needUpdate}
          callback={() => {
            LinkToStore()
          }}
          okText={translate("go_update_app")}
          cancelText={translate("close")}
          modalClose={() => {
            updateToggle({ needUpdate: false, isChecked: true })
            firstSettingFunc();
          }}
        />
        <CustomNotification
          title={translate("is_ADB_title")}
          noConfirm
          confirm_style={{ backgroundColor: '#666666' }}
          onLayout={() => {
            customExitApp();
          }}
          msg={
            <>
              <Text style={{ textAlign: 'center' }}>
                {translate("is_ADB_msg_1")}
              </Text>
              <Text style={{ textAlign: 'center' }}>
                {translate("is_ADB_msg_2")}
              </Text>
            </>
          }
          modalOpen={usbConnected.isChecked && usbConnected.usbConnected}
        />
        <CustomNotification
          title={translate("is_Rooting_title")}
          noConfirm
          confirm_style={{ backgroundColor: '#666666' }}
          onLayout={() => {
            customExitApp();
          }}
          msg={
            <>
              <Text style={{ textAlign: 'center' }}>
                {translate("is_Rooting_msg_1")}
              </Text>
            </>
          }
          modalOpen={isRoot.isChecked && isRoot.isRoot}
        />
        <CustomNotification
          title={translate("is_Forgery_title")}
          noConfirm
          confirm_style={{ backgroundColor: '#666666' }}
          onLayout={() => {
            customExitApp();
          }}
          msg={
            <>
              <Text style={{ textAlign: 'center' }}>
                {translate("is_Forgery_msg_1")}
              </Text>
              <Text style={{ textAlign: 'center' }}>
                {translate("is_Forgery_msg_2")}
              </Text>
              <Text style={{ textAlign: 'center' }}>
                {translate("is_Forgery_msg_3")}
              </Text>
            </>
          }
          modalOpen={isForgery.isChecked && isForgery.isForgery}
        />
        <CustomNotification
          title={translate("is_Deprecated_title")}
          confirm_style={{ backgroundColor: '#666666' }}
          callback={() => {
            LinkToStore()
            customExitApp(true);
          }}
          msg={
            <>
              <Text style={{ textAlign: 'center' }}>
                {translate("is_Deprecated_msg_1")}
              </Text>
              <Text style={{ textAlign: 'center' }}>
                {translate("is_Deprecated_msg_2")}
              </Text>
            </>
          }
          modalOpen={isDeprecated.isChecked && isDeprecated.isDeprecated}
        />
        <CustomNotification
          title={translate("server_error_title")}
          confirm_style={{ backgroundColor: '#666666' }}
          msg={
            <>
              <Text style={{ textAlign: 'center' }}>
                {translate("server_error_msg_1")}
              </Text>
              <Text style={{ textAlign: 'center' }}>
                {translate(networkError ? "server_error_msg_2" : "server_error_msg_3")}
              </Text>
            </>
          }
          modalOpen={serverError || networkError}
          callback={() => {
            setNetworkError(false);
            setServerError(false);
            checkForgeryFunc();
          }}
          okText={translate("tryAgain")}
          modalClose={() => {
            setNetworkError(false);
            setServerError(false);
          }}
        />
      </SafeAreaProvider>
    </>
  )
}

function mapStateToProps(state) {
  return {
    isLoading: state.isLoading,
    Authentications: state.Authentications,
    currentAuth: state.currentAuth,
    notificationToggle: state.notificationToggle,
    notificationMsg: state.notificationMsg,
    notificationTitle: state.notificationTitle,
    notificationCallback: state.notificationCallback,
    iosType: state.iosType,
    needUpdate: state.needUpdate,
    isRoot: state.isRoot,
    usbConnected: state.usbConnected,
    isForgery: state.isForgery,
    firstSetting: state.firstSetting,
    isDeprecated: state.isDeprecated
  };
}

function mapDispatchToProps(dispatch) {
  return {
    auth: (info) => {
      dispatch(ActionCreators.settingAuthentications(info))
    },
    auth_all: async (info) => {
      dispatch(ActionCreators.settingAllAuthentications(info))
    },
    changeCurrentAuth: async (auth) => {
      dispatch(ActionCreators.settingCurrentAuth(auth));
    },
    changeNotificationToggle: (auth) => {
      dispatch(ActionCreators.changeNotificationToggle(auth));
    },
    changeNotificationMsg: (auth) => {
      dispatch(ActionCreators.changeNotificationMsg(auth));
    },
    changeNotificationTitle: (auth) => {
      dispatch(ActionCreators.changeNotificationTitle(auth));
    },
    iosTypeToggle: (toggle) => {
      dispatch(ActionCreators.iosTypeToggle(toggle));
    },
    updateToggle: (toggle) => {
      dispatch(ActionCreators.updateToggle(toggle));
    },
    isForgeryChange: (toggle) => {
      dispatch(ActionCreators.isForgeryChange(toggle));
    },
    isDeprecatedChange: (toggle) => {
      dispatch(ActionCreators.isDeprecatedChange(toggle));
    },
    isRootChange: (toggle) => {
      dispatch(ActionCreators.isRootChange(toggle));
    },
    usbConnectedChange: (toggle) => {
      dispatch(ActionCreators.usbConnectedChange(toggle));
    },
    setFirstSetting: (toggle) => {
      dispatch(ActionCreators.firstSettingToggle(toggle))
    }
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Routes);