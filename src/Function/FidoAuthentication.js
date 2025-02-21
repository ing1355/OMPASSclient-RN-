import Authenticate from '../Auth/Authenticate';
import webAuthn from '../Auth/webAuthn';
import * as navigation from '../Route/Router';
import { BackHandler, NativeModules, Platform, Text, View } from 'react-native';
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { connect, useDispatch, useSelector } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translate } from '../../App';
import { CustomConfirmModal } from '../Components/CustomAlert';
import { GetClientInfo } from './GetClientInfo';
import { AsyncStorageAuthenticationsKey, AsyncStorageCurrentAuthKey, AsyncStorageFcmTokenKey } from '../Constans/ContstantValues';
import { saveAuthLogByResult, saveDataToLogFile } from './GlobalFunction';
import RegisterAuthentication from '../Auth/RegisterAuthentication';
import ActionCreators from '../global_store/actions';
import * as RNLocalize from 'react-native-localize';
import { changeNotificationToggle } from '../global_store/actions/Notification';
import { ENVIRONMENT } from '@env'
import { CustomSystem } from './NativeModules';

const isDev = ENVIRONMENT === 'dev'
const NoLogKeys = ['앱 재설치', 'SSLerror', 'CODE003']
const isKr = RNLocalize.getLocales()[0].languageCode === 'ko'

const RightMsg = (title, description) => {
  return <View style={{ flexDirection: 'row', marginBottom: 3, alignItems: 'center' }}>
    <Text style={{ flex: isKr ? 0.5 : .75, top: 0 }}>{translate(title)} </Text>
    <Text style={{ flex: 2, textAlign: 'left' }} numberOfLines={2} ellipsizeMode="tail">
      {description}
    </Text>
  </View>
}

const initAuthData = {
  domain: '',
  did: 0,
  redirectUri: '',
  username: '',
  accessKey: '',
  fidoAddress: '',
  clientInfo: {
    alias: '',
    browser: '',
    gpu: '',
    os: '',
    osVersion: '',
    name: '',
    ip: '',
    location: '',
    uuid: ''
  },
  displayName: '',
  procedure: '',
  applicationName: ''
}

const FidoAuthentication = ({ isQR, tempAuthData, isForgery, isRoot, usbConnected, needUpdate, loadingToggle, currentAuth, modalCloseCallback, initCallback }) => {
  const [authData, setAuthData] = useState(initAuthData)
  const { domain, did, redirectUri, accessKey, fidoAddress, clientInfo, displayName, procedure } = authData || {};
  const { uuid } = clientInfo || {}
  const username = uuid ? `${authData.username}~${uuid}` : authData.username
  const { notificationToggle, appSettings } = useSelector(state => ({
    notificationToggle: state.notificationToggle,
    appSettings: state.appSettings
  }))
  const [modalOpen, setModalOpen] = useState(false);
  const dispatch = useDispatch()

  const cancelInitFunction = () => {
    setAuthData(initAuthData)
  }

  async function check_auth_info() {
    const auth_info = await AsyncStorage.getItem(AsyncStorageAuthenticationsKey);
    if (auth_info) {
      const auth_data = JSON.parse(auth_info);
      let count = 0;
      Object.keys(auth_data).map((key) => {
        if (auth_data[key]) count++;
      });
      if (count < 2) {
        return false
      }
      return true
    } else {
      return false
    }
  }

  const RouteFiltering = () => {
    const routeState = navigation.navigationRef.current.getState()
    if (!routeState) return;
    const routeInfo = routeState.routes
    if (routeInfo.find(route => route.name === 'Auth_Complete' || route.name === 'Auth_Fail') || isQR) {
      const filteredRoute = routeInfo.filter(route => route.name !== 'Auth_Complete' && route.name !== 'Auth_Fail' && route.name !== 'QrCode')
      navigation.navigationRef.current.reset({
        index: filteredRoute.length - 1,
        routes: filteredRoute
      })
    }
  }

  const AuthCompleteCallback = (type) => {
    const callback = () => {
      if (procedure === 'auth') CustomSystem.cancelNotification(accessKey)
      if (!appSettings.exitAfterAuth && clientInfo && clientInfo.browser && clientInfo.browser.includes('Mobile')) {
        BackHandler.exitApp()
      }
    }
    RouteFiltering()
    if (type === 'OMPASSRegist') {
      navigation.replace('Auth_Complete', { type: "OMPASSRegist", callback });
    } else {
      navigation.replace('Auth_Complete', { type: "OMPASSAuth", callback });
    }
  }

  const AuthErrorCallback = (type, err, navigate) => {
    cancelInitFunction()
    RouteFiltering()
    if (navigate) {
      navigation.navigate('Auth_Fail', {
        type,
        reason: err,
      });
    } else {
      navigation.replace('Auth_Fail', {
        type,
        reason: err,
      });
    }
  }

  const callbackFunc = async (isSameDevice) => {
    if (procedure === 'reg') {
      saveDataToLogFile("Register Request(AuthData)", authData)
      webAuthn.PreRegister(
        fidoAddress,
        domain,
        accessKey,
        username,
        displayName,
        redirectUri,
        Number(did),
        function (err) {
          console.log('pre register err ? : ', err);
          loadingToggle(false);
          saveDataToLogFile("PreRegister Fail(Response Json)", err)
          saveAuthLogByResult('reg', false, authData)
          setTimeout(() => {
            AuthErrorCallback('OMPASSRegist', err, true)
          }, 10);
        },
        (suc) => {
          const { authorization, challenge, userId } =
            Platform.OS === 'android' ? JSON.parse(suc) : suc;
          saveDataToLogFile("PreRegister Success(Response Json)", { authorization, challenge, userId })
          console.log('preRigster suc : ', suc);
          const Register_Callback = async () => {
            webAuthn.Register(
              fidoAddress,
              domain,
              accessKey,
              username,
              await GetClientInfo(clientInfo),
              displayName,
              await AsyncStorage.getItem(AsyncStorageFcmTokenKey),
              authorization,
              challenge,
              userId,
              function (err) {
                console.log('register err ? : ', err);
                saveDataToLogFile("Register Fail(Response Json)", err)
                saveAuthLogByResult('reg', false, authData)
                AuthErrorCallback('OMPASSRegist', err)
              },
              async (msg) => {
                loadingToggle(false);
                saveDataToLogFile("Register Success(Response Json)", msg)
                saveAuthLogByResult('reg', true, authData)
                setTimeout(() => {
                  AuthCompleteCallback('OMPASSRegist')
                }, 10);
              },
            );
          };
          return RegisterAuthentication(currentAuth, Register_Callback, cancelInitFunction, isQR);
        },
      );
    } else {
      const currentAuth = await AsyncStorage.getItem(AsyncStorageCurrentAuthKey);
      saveDataToLogFile("Authentication Request(AuthData)", authData)
      webAuthn.PreAuthenticate(fidoAddress, domain, accessKey, redirectUri, Number(did), username, (err) => {
        console.log('pre authenticate err ? : ', err);
        saveDataToLogFile("PreAuthenticate Fail(Response Json)", err)
        if (!NoLogKeys.find(_ => err.includes(_))) {
          saveAuthLogByResult('auth', false, authData);
        }
        AuthErrorCallback("OMPASSAuth", err, true)
      }, (msg) => {
        const { authorization, challenge, userId } = Platform.OS === 'android' ? JSON.parse(msg) : msg;
        saveDataToLogFile("PreAuthenticate Success(Response Json)", { authorization, challenge, userId })
        const Auth_Callback = async () => {
          webAuthn.Authenticate(await AsyncStorage.getItem(AsyncStorageFcmTokenKey), fidoAddress, domain, accessKey, username, authorization, challenge, userId, await GetClientInfo(), (err) => {
            console.log('authenticate err ? : ', err);
            saveDataToLogFile("Authenticate Fail(Authenticate Response Json)", err)
            if (!NoLogKeys.find(_ => err.includes(_))) {
              saveAuthLogByResult('auth', false, authData);
            }
            AuthErrorCallback("OMPASSAuth", err)
          }, (msg) => {
            if (isSameDevice === 'false') {
              // RNFetchBlob.config({ trusty: true }).fetch(
              //   'POST',
              //   'https://' + fidoAddress + `/client-info/save/did/${did}/username/${username}`,
              //   {
              //     'Content-Type': 'application/json',
              //     'Authorization': msg
              //   },
              //   JSON.stringify({
              //     ...clientInfo
              //   }),
              // )
              //   .then(async (resp) => {
              //     console.log(resp)
              //     saveAuthLogByResult('auth', true, authData);
              //     setTimeout(() => {
              //       setExecute(false);
              //       navigation.replace('Auth_Complete', "OMPASSAuth");
              //     }, 100);
              //   })
              //   .catch((err) => {
              //     console.log(err);
              //   });
            } else {
              saveDataToLogFile("Authenticate Success(Response Json)", msg)
              saveAuthLogByResult('auth', true, authData);
              setTimeout(() => {
                // setExecute(false);
                AuthCompleteCallback('OMPASSAuth')
              }, 100);
            }
          });
        }
        return Authenticate(currentAuth, Auth_Callback, cancelInitFunction, isQR);
      })
    }
  }

  useLayoutEffect(() => {
    if (tempAuthData.accessKey && isForgery.isChecked && isRoot.isChecked && usbConnected.isChecked && needUpdate.isChecked && !(isForgery.isForgery || isRoot.isRoot || usbConnected.usbConnected || needUpdate.needUpdate)) {
      const withAuthCheck = async () => {
        if (await check_auth_info()) {
          // if (execute && true) {
          if (modalOpen) {
            setModalOpen(false)
          }
          setTimeout(() => {
            setModalOpen(true)
          }, 10);
          if (tempAuthData.procedure === 'auth') {

          } else {
            // RNFetchBlob.config({ trusty: true }).fetch(
            //   'POST',
            //   'https://' + fidoAddress + `/client-info/verify/did/${did}/username/${username}`,
            //   { 'Content-Type': 'application/json' },
            //   JSON.stringify({
            //     ...clientInfo
            //   }),
            // )
            //   .then(async (resp) => {
            //     if (resp.data === 'false') {
            //       setModalOpen(true);
            //       callbackRef.current = () => {
            //         callbackFunc(resp.data);
            //       }
            //     } else {
            //       callbackFunc(resp.data);
            //     }
            //   })
            //   .catch((err) => {
            //     console.log(err);
            //   });
          }
        }
      }
      withAuthCheck()
    }
  }, [isForgery, isRoot, usbConnected, needUpdate, tempAuthData])

  useEffect(() => {
    if (authData.accessKey) {
      callbackFunc();
    }
  }, [authData])

  return <>
    <CustomConfirmModal
      title={translate('confirmUserTitle', { type: procedure === 'reg' ? (isKr ? '등록' : 'Registration') : (isKr ? '인증' : 'Authentication') })}
      yesOrNo
      msg={
        <>
          {RightMsg('authFirstItemTitle', tempAuthData.applicationName)}
          {RightMsg('authSecondItemTitle', tempAuthData.username)}
          {/* {RightMsg('authSecondItemTitle', tempAuthData && tempAuthData.accessKey && tempAuthData.accessKey.split('.')[2])} */}
          {RightMsg('authThirdItemTitle', tempAuthData.clientInfo && tempAuthData.clientInfo.ip)}
          {RightMsg('authFourthItemTitle', tempAuthData.clientInfo && tempAuthData.clientInfo.location)}
          <Text style={{ textAlign: 'center', marginTop: 8 }}>
            {translate('confirmUserDescription') + '\n'}
          </Text>
        </>
      }
      onShow={() => {
        dispatch(changeNotificationToggle(true))
      }}
      modalOpen={modalOpen}
      modalClose={() => {
        if (modalCloseCallback) modalCloseCallback()
        setModalOpen(false);
        setTimeout(() => {
          dispatch(changeNotificationToggle(false))
        }, 1000);
      }}
      cancelCallback={() => {
        if (initCallback) initCallback()
        // onCancelNewDevice({ username, did, fidoAddress });
      }}
      callback={() => {
        if (initCallback) initCallback()
        setAuthData(tempAuthData)
      }} />
      {notificationToggle && <View style={{
        width: '100%',
        height: '100%',
        position: 'absolute',
        zIndex: 1,
        backgroundColor:'transparent'
      }}/>}
  </>
}

function mapStateToProps(state) {
  return {
    currentAuth: state.currentAuth,
    needUpdate: state.needUpdate,
    isRoot: state.isRoot,
    usbConnected: state.usbConnected,
    isForgery: state.isForgery
  };
}

function mapDispatchToProps(dispatch) {
  return {
    loadingToggle: (toggle) => {
      dispatch(ActionCreators.loadingToggle(toggle));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(FidoAuthentication);