import Authenticate from '../Auth/Authenticate';
import webAuthn from '../Auth/webAuthn';
import * as navigation from '../Route/Router';
import { Platform, Text } from 'react-native';
import RNFetchBlob from 'rn-fetch-blob';
import React, { useLayoutEffect, useRef, useState } from 'react'
import { connect } from 'react-redux';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { isAuthenticateCheckedToggle, translate } from '../../App';
import { onCancelNewDevice } from './onCancelNewDevice';
import { CustomConfirmModal } from '../Components/CustomAlert';
import { GetClientInfo } from './GetClientInfo';
import { AsyncStorageCurrentAuthKey, AsyncStoragePushDataKey } from '../Constans/ContstantValues';
import { saveAuthLogByResult } from './GlobalFunction';
import notifee from '@notifee/react-native'

const FidoAuthentication = ({ authData, isForgery, isRoot, usbConnected, needUpdate, execute, setExecute }) => {
  const { domain, did, redirectUri, username, accessKey, fidoAddress, clientInfo } = authData || {};
  const [modalOpen, setModalOpen] = useState(false);
  const callbackRef = useRef(null);

  const callbackFunc = async (data) => {
    if(Platform.OS === 'ios') {
      await notifee.setBadgeCount(0)
    }
    // NativeModules.Notification.NotificationCancel((res) => {
    //   console.log(res)
    // }, err => {
    //   console.log(err)
    // })
    const currentAuth = await AsyncStorage.getItem(AsyncStorageCurrentAuthKey);
    webAuthn.PreAuthenticate(fidoAddress, domain, accessKey, redirectUri, Number(did), username, (err) => {
      console.log('pre authenticate err ? : ', err);
      saveAuthLogByResult('auth', false, authData);
      navigation.replace("Auth_Fail", { type: "OMPASSAuth", reason: err });
    }, (msg) => {
      const { authorization, challenge, userId } = Platform.OS === 'android' ? JSON.parse(msg) : msg;
      const Auth_Callback = async () => {
        webAuthn.Authenticate(fidoAddress, domain, accessKey, username, authorization, challenge, userId, await GetClientInfo(), (err) => {
          console.log('authenticate err ? : ', err);
          saveAuthLogByResult('auth', false, authData);
          navigation.replace("Auth_Fail", { type: "OMPASSAuth", reason: err });
        }, (msg) => {
          console.log(msg, data);
          if (data === 'false') {
            RNFetchBlob.config({ trusty: true }).fetch(
              'POST',
              'https://' + fidoAddress + `/client-info/save/did/${did}/username/${username}`,
              {
                'Content-Type': 'application/json',
                'Authorization': msg
              },
              JSON.stringify({
                ...clientInfo
              }),
            )
              .then(async (resp) => {
                console.log(resp)
                saveAuthLogByResult('auth', true, authData);
                setTimeout(() => {
                  setExecute(false);
                  navigation.replace('Auth_Complete', "OMPASSAuth");
                }, 100);
              })
              .catch((err) => {
                console.log(err);
              });
          } else {
            saveAuthLogByResult('auth', true, authData);
            setTimeout(() => {
              setExecute(false);
              navigation.replace('Auth_Complete', "OMPASSAuth");
            }, 100);
          }
        });
      }

      return Authenticate(currentAuth, Auth_Callback);
    })
  }

  useLayoutEffect(() => {
    if (isForgery.isChecked && isRoot.isChecked && usbConnected.isChecked && needUpdate.isChecked && !(isForgery.isForgery || isRoot.isRoot || usbConnected.usbConnected || needUpdate.needUpdate)) {
      if (execute) {
        const preFunc = async () => {
          await AsyncStorage.removeItem(AsyncStoragePushDataKey)
          isAuthenticateCheckedToggle(false)
        }
        preFunc()
        RNFetchBlob.config({ trusty: true }).fetch(
          'POST',
          'https://' + fidoAddress + `/client-info/verify/did/${did}/username/${username}`,
          { 'Content-Type': 'application/json' },
          JSON.stringify({
            ...clientInfo
          }),
        )
          .then(async (resp) => {
            if (resp.data === 'false') {
              setModalOpen(true);
              callbackRef.current = () => {
                callbackFunc(resp.data);
              }
            } else {
              callbackFunc(resp.data);
            }
          })
          .catch((err) => {
            console.log(err);
          });
      }
    }
  }, [isForgery, isRoot, usbConnected, needUpdate, authData, execute])

  return <CustomConfirmModal
    title={translate('newDeviceTitle')}
    yesOrNo
    msg={
      <>
        <Text style={{ textAlign: 'center' }}>
          {translate('newDeviceDescription') + '\n'}
        </Text>
        <Text numberOfLines={1} ellipsizeMode="tail">
          GPU : {clientInfo ? clientInfo.gpu : null}
        </Text>
        <Text numberOfLines={1} ellipsizeMode="tail">
          OS : {clientInfo ? clientInfo.os : null}
        </Text>
        <Text numberOfLines={1} ellipsizeMode="tail">
          OS Version : {clientInfo ? clientInfo.osVersion : null}
        </Text>
        <Text numberOfLines={1} ellipsizeMode="tail">
          Browser : {clientInfo ? clientInfo.browser : null}
        </Text>
      </>
    }
    modalOpen={modalOpen}
    modalClose={() => {
      setModalOpen(false);
    }}
    cancelCallback={() => {
      onCancelNewDevice({ username, did, fidoAddress });
    }}
    callback={() => {
      if (callbackRef.current) callbackRef.current();
    }} />
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
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(FidoAuthentication);