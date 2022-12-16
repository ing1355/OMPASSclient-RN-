import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Platform, Pressable, Image, Vibration, Animated } from 'react-native';
import styles from '../../styles/QrCode';
import webAuthn from '../../Auth/webAuthn';
import { CustomNotification } from '../../Components/CustomAlert';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { connect } from 'react-redux';
import ActionCreators from '../../global_store/actions';
import RegisterAuthentication from '../../Auth/RegisterAuthentication';
import * as RootNavigation from '../../Route/Router';
import { translate } from '../../../App';
import FidoAuthentication from '../../Function/FidoAuthentication';
import { GetClientInfo } from '../../Function/GetClientInfo';
import RNFetchBlob from 'rn-fetch-blob';
import { CameraScreen } from 'react-native-camera-kit';
import { AsyncStorageFcmTokenKey } from '../../Constans/ContstantValues';
import { saveAuthLogByResult } from '../../Function/GlobalFunction';

const animationTime = 3000

const QrCode = (props) => {
  const [execute, setExecute] = useState(false);
  const [qr_result, setQr_result] = useState(null);
  const [isFocused, setIsFocused] = useState(false);
  const [textView, setTextView] = useState(true)
  const qrAnimation = useRef(new Animated.Value(1)).current
  const qrAnimationStyles = {
    transform: [{ scale: qrAnimation }],
  }
  const scanRef = useRef(false);

  useEffect(() => {
    const unsubscribe = props.navigation.addListener('focus', async () => {
      setIsFocused(true);
      props.loadingToggle(false);
      setTimeout(() => {
        setTextView(false)
      }, animationTime);
      Animated.timing(qrAnimation, {
        toValue: 1.2,
        duration: animationTime / 6,
        delay: animationTime,
        useNativeDriver: true
      }).start()
    });
    const blurListener = props.navigation.addListener('blur', () => {
      setIsFocused(false);
    });
    return () => {
      unsubscribe();
      blurListener();
    };
  }, [props.navigation]);

  function isJson(str) {
    try {
      JSON.parse(str);
    } catch (e) {
      return false;
    }
    return true;
  }

  async function onSuccess(e) {
    console.log(e.nativeEvent.codeStringValue)
    if (!scanRef.current) {
      scanRef.current = true;
      const qrData = e.nativeEvent.codeStringValue;
      if (isJson(qrData)) {
        const { url, param, userId } = JSON.parse(e.nativeEvent.codeStringValue);
        if (!url && !param) {
          scanRef.current = false;
          return;
        } else {
          RNFetchBlob.config({
            trusty: true,
          })
            .fetch(
              'POST',
              url,
              {
                'Content-Type': 'application/json',
              },
              JSON.stringify(userId ? {
                nonce: param,
                userId
              } : {
                  nonce: param
                }),
            )
            .then(async (resp) => {
              const { data } = resp;
              const result = JSON.parse(data);
              props.loadingToggle(true);
              setQr_result(result);
              setTimeout(() => {
                props.loadingToggle(false);
                Qr_complete(result);
              }, 100);
            })
            .catch((err) => {
              console.log(err);
              scanRef.current = false;
              props.loadingToggle(false);
            });
        }
      } else {
        scanRef.current = false;
      }
    }
  }

  async function Qr_complete(result) {
    Vibration.vibrate();
    const { loadingToggle } = props;
    const {
      procedure,
      domain,
      accessKey,
      username,
      displayName,
      redirectUri,
      did,
      fidoAddress,
      clientInfo,
    } = result;
    console.log(result)
    if (procedure === 'reg') {
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
          saveAuthLogByResult('reg', false, result)
          setTimeout(() => {
            RootNavigation.replace('Auth_Fail', {
              type: 'OMPASSRegist',
              reason: err,
            });
          }, 10);
        },
        (suc) => {
          const { authorization, challenge, userId } =
            Platform.OS === 'android' ? JSON.parse(suc) : suc;
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
                saveAuthLogByResult('reg',false, result)
                RootNavigation.replace('Auth_Fail', {
                  type: 'OMPASSRegist',
                  reason: err,
                });
              },
              async (msg) => {
                console.log('msg : ', msg);
                loadingToggle(false);
                console.log('1')
                saveAuthLogByResult('reg', true, result)
                console.log('2')
                setTimeout(() => {
                  RootNavigation.replace('Auth_Complete', 'OMPASSRegist');
                }, 10);
              },
            );
          };
          return RegisterAuthentication(props.currentAuth, Register_Callback);
        },
      );
    } else if (procedure === 'auth') {
      setExecute(true);
    }
  }
  return (
    <>
      <FidoAuthentication
        authData={qr_result}
        setAuthData={setQr_result}
        execute={execute}
        setExecute={setExecute}
      />
      <View style={styles.container}>
        <View
          style={{
            flex: 1,
            zIndex: 2,
            paddingTop: 30
          }}>
          <View style={[styles.qr_masking, { flex: 1 }]}>
            <Pressable
              style={{
                position: 'absolute',
                top: 15,
                right: 15,
                width: 60,
                height: 60,
                justifyContent: 'center',
                alignItems: 'center',
              }}
              onPress={() => {
                setIsFocused(false);
                props.loadingToggle(true);
                RootNavigation.reset();
              }}>
              <Image
                style={{ width: '40%', height: '80%' }}
                source={require('../../assets/btn_x_white.png')}
                resizeMode="contain"
              />
            </Pressable>
          </View>
          <View style={[styles.qr_masking, { flex: 1 }]}>
            <Text style={[styles.qr_text, {
              opacity: textView ? 1 : 0
            }]}>
              {translate('QRCodeText')}
            </Text>
          </View>
          <View style={{ flex: 1.8, flexDirection: 'row' }}>
            <View style={[styles.qr_masking, { flex: 1 }]} />
            <View style={[styles.qr_square]}>
              <Animated.Image
                style={[{ width: '100%', height: '100%' }, qrAnimationStyles]}
                source={require('../../assets/qr_square.png')}
                resizeMode="contain"
              />
            </View>
            <View style={[styles.qr_masking, { flex: 1 }]} />
          </View>
          <View style={[styles.qr_masking, { flex: 2 }]} />
        </View>
        {isFocused && (
          <View style={{ position: 'absolute', zIndex: 1, width: '100%', height: '100%' }}>
            <CameraScreen onReadCode={onSuccess} scanBarcode ratioOverlay="1:1" hideControls={true} />
          </View>
        )}
      </View>
    </>
  );
};

function mapStateToProps(state) {
  return {
    isLoading: state.isLoading,
    currentAuth: state.currentAuth,
    notificationMsg: state.notificationMsg,
    notificationTitle: state.notificationTitle,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    loadingToggle: (toggle) => {
      dispatch(ActionCreators.loadingToggle(toggle));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(QrCode);
