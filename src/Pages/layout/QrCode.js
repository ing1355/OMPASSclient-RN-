import React, { useEffect, useRef, useState } from 'react';
import { View, Text, Pressable, Image, Animated, Vibration } from 'react-native';
import styles from '../../styles/QrCode';
import { connect } from 'react-redux';
import ActionCreators from '../../global_store/actions';
import * as RootNavigation from '../../Route/Router';
import { translate } from '../../../App';
import FidoAuthentication from '../../Function/FidoAuthentication';
import { CameraScreen } from 'react-native-camera-kit';
import { getDataByNonce, isJson } from '../../Function/GlobalFunction';
import { Camera, useCameraDevices, useFrameProcessor } from 'react-native-vision-camera';
import { BarcodeFormat, scanBarcodes, useScanBarcodes } from 'vision-camera-code-scanner';
import Reanimated, { useSharedValue, useAnimatedProps, runOnJS } from 'react-native-reanimated';

const ReanimatedCamera = Reanimated.createAnimatedComponent(Camera)
Reanimated.addWhitelistedNativeProps({
  zoom: true,
})

const animationTime = 3000

const initQrData = {
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

const QrCode = (props) => {
  const [hasPermission, setHasPermission] = useState(false);
  const [qr_result, setQr_result] = useState(initQrData)
  const [isFocused, setIsFocused] = useState(false);
  const [textView, setTextView] = useState(true)
  const qrAnimation = useRef(new Animated.Value(1)).current
  const qrAnimationStyles = {
    transform: [{ scale: qrAnimation }],
  }
  const zoom = useSharedValue(1.1)
  const animatedProps = useAnimatedProps(
    () => ({ zoom: zoom.value }),
    [zoom]
  )

  const scanRef = useRef(false);
  const ultra_devices = useCameraDevices('ultra-wide-angle-camera')
  const devices = useCameraDevices('wide-angle-camera')
  const _devices = useCameraDevices()
  const device = _devices.back || ultra_devices.back || devices.back

  const [frameProcessor, barcodes] = useScanBarcodes([BarcodeFormat.QR_CODE], {
    checkInverted: true,
  });

  // const frameProcessor = useFrameProcessor((frame) => {
  //   'worklet';
  //   const detectedBarcodes = scanBarcodes(frame, [BarcodeFormat.QR_CODE], {checkInverted: true});
  //   if(detectedBarcodes[0]) {
  //     console.log('detected')
  //     console.log(detectedBarcodes[0])
  //     runOnJS(onSuccess)(detectedBarcodes[0].content.data);
  //   } else {
  //     console.log('no detected')
  //   }
  // }, []);

  useEffect(() => {
    if(barcodes.length) onSuccess(barcodes[0].content.data)
  },[barcodes])
  
  useEffect(() => {
    const unsubscribe = props.navigation.addListener('focus', async () => {
      const status = await Camera.requestCameraPermission();
      setHasPermission(status === 'authorized');
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

  async function onSuccess(qrData) {
    if (!scanRef.current && qrData) {
      scanRef.current = true;
      // const qrData = e.nativeEvent.codeStringValue;
      if (isJson(qrData)) {
        // const { url, param, userId } = JSON.parse(e.nativeEvent.codeStringValue);
        const { url, param, userId } = JSON.parse(qrData);
        if (!url && !param) {
          scanRef.current = false;
          return;
        } else {
          props.loadingToggle(true);
          getDataByNonce(url, param, userId, (result) => {
            console.log(result)
            setQr_result(result);
            props.loadingToggle(false);
          }, err => {
            console.log(err)
            scanRef.current = false;
            props.loadingToggle(false);
            Vibration.vibrate()
            RootNavigation.navigate('Auth_Fail', {
              type: url.includes('auth') ? 'OMPASSAuth' : 'OMPASSRegist',
              reason: translate('CODE002'),
            });
          })
        }
      } else {
        scanRef.current = false;
      }
    }
  }
  
  return (
    <>
      <FidoAuthentication
        tempAuthData={qr_result}
        isQR={true}
        initCallback={() => {
          setQr_result(initQrData)
        }}
        modalCloseCallback={() => {
          scanRef.current = false
        }}
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
            { device && hasPermission && <ReanimatedCamera
              style={{
                width:'100%',
                height:'100%'
              }}
              animatedProps={animatedProps}
              frameProcessorFps={5}
              frameProcessor={frameProcessor}
              device={device}
              isActive={true}
            />}
            {/* <CameraScreen onReadCode={onSuccess} scanBarcode ratioOverlay="1:1" hideControls={true}/> */}
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
