import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import {
  ImageBackground,
  Platform,
  Text,
  View,
  Image,
  Pressable,
  BackHandler,
  ToastAndroid,
  Dimensions,
  Animated,
  NativeModules
} from 'react-native';
import styles from '../styles/Home';
import { connect } from 'react-redux';
import { CheckPermission } from '../Components/CheckPermissions';
import ActionCreators from '../global_store/actions';
import { CustomNotification } from '../Components/CustomAlert';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translate } from '../../App';
import MenuButton from './Menu/MenuButton';
import MenuSidebar from './Menu/MenuSidebar';
import { AsyncStorageAuthenticationsKey, AsyncStorageCurrentAuthKey } from '../Constans/ContstantValues';
import CustomButton from '../Components/CustomButton';
import * as RootNavigation from '../Route/Router'
let { height } = Dimensions.get('window');
let clickButton = false

const Home = ({
  route,
  changeCurrentAuth,
  auth_all,
  navigation,
  loadingToggle,
  isRoot,
  isForgery,
  usbConnected,
  needUpdate,
  firstSetting,
}) => {
  const [qrPressed, setQrPressed] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [notifyOpen_3, setNotifyOpen_3] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuOpenRef = useRef(null)

  let backClickCount = 0;
  const backClickRef = useRef(backClickCount);
  let springValue = new Animated.Value(100);
  
  const qrAnimation = useRef(new Animated.Value(1)).current;
  const qrAnimationStyles = {
    transform: [{ scale: qrAnimation }],
  };
  const tooltipAnimation = useRef(new Animated.Value(1)).current;
  const tooltipAnimationStyles = {
    transform: [{
      translateY: tooltipAnimation
    }]
  }

  async function check_auth_info() {
    const auth_info = await AsyncStorage.getItem(AsyncStorageAuthenticationsKey);
    const currentAuth = await AsyncStorage.getItem(AsyncStorageCurrentAuthKey);
    if (currentAuth) {
      await changeCurrentAuth(currentAuth);
    }
    if (auth_info) {
      const auth_data = JSON.parse(auth_info);
      await auth_all(JSON.parse(auth_info));
      let count = 0;
      Object.keys(auth_data).map((key) => {
        if (auth_data[key]) count++;
      });
      if (count < 2) {
        setNotifyOpen(true);
      }
    } else {
      setNotifyOpen(true);
    }
  }

  const handleBackButton = () => {
    if(menuOpenRef.current) setMenuOpen(false)
    else {
      backClickRef.current === 1 ? NativeModules.CustomSystem.ExitApp() : _spring();
    }
    return true;
  };

  function _spring() {
    if (RootNavigation.getRouteName() !== 'home') return;
    ToastAndroid.show(translate('homeBackMessage'), ToastAndroid.SHORT);
    backClickRef.current = 1;
    Animated.sequence([
      Animated.spring(springValue, {
        toValue: -0.15 * height,
        friction: 5,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(springValue, {
        toValue: 100,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      backClickRef.current = 0;
    });
  }
  
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      loadingToggle(false);
      clickButton = false
      if (Platform.OS === 'android') BackHandler.addEventListener('hardwareBackPress', handleBackButton)
    });
    
    const unsubscribeBlur = navigation.addListener('blur', async () => { 
      if (Platform.OS === 'android') BackHandler.removeEventListener('hardwareBackPress', handleBackButton)
    });
    Animated.loop(Animated.sequence([Animated.timing(tooltipAnimation, {
      toValue: 10,
      duration: 500,
      useNativeDriver: true
    }), Animated.timing(tooltipAnimation, {
      toValue: 0,
      duration: 1000,
      useNativeDriver: true
    })])).start()
    return () => {
      unsubscribe();
      unsubscribeBlur();
    };
  }, [navigation]);

  useEffect(() => {
    if (
      firstSetting &&
      isForgery.isChecked &&
      isRoot.isChecked &&
      usbConnected.isChecked &&
      needUpdate.isChecked&&
      !(
        isForgery.isForgery ||
        isRoot.isRoot ||
        usbConnected.usbConnected ||
        needUpdate.needUpdate
      )
    ) {
      check_auth_info();
    }
  }, [isForgery, isRoot, usbConnected, needUpdate, firstSetting]);

  const menuToggle = () => {
    setMenuOpen(!menuOpen);
  };

  useLayoutEffect(() => {
    menuOpenRef.current = menuOpen
  },[menuOpen])

  useEffect(() => {
    Animated.timing(qrAnimation, {
      toValue: qrPressed ? 1.3 : 1,
      duration: 200,
      useNativeDriver: true
    }).start();
  }, [qrPressed]);

  return (
    <>
      <ImageBackground
        style={styles.container}
        source={require('../assets/bg.png')}>
        <CustomButton style={styles.menu_btn} onPress={() => {
          menuToggle()
        }}>
          <MenuButton />
        </CustomButton>
        <View style={{ flex: 0.5 }}></View>
        <View
          style={{
            flex: 1,
            flexDirection: 'column',
            justifyContent: 'flex-end',
          }}>
          <Image
            source={require('../assets/ompass_logo.png')}
            style={styles.ompass_logo}
            resizeMode="contain"
          />
        </View>
        <View
          style={{
            flex: 0.5,
            flexDirection: 'column',
            justifyContent: 'flex-start',
          }}>
          <Text style={styles.center_text}>{translate('main_top_text')}</Text>
        </View>
        <View
          style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}>
          <Image
            style={styles.mark}
            resizeMode="contain"
            source={require('../assets/mark.png')}
          />
        </View>
        <View style={{ flex: 1 }} />

        <Pressable
          style={styles.qr_navigate}
          onPressIn={(e) => {
            setQrPressed(true);
          }}
          onPressOut={() => {
            setQrPressed(false);
          }}
          onPress={async () => {
            if (!clickButton) {
              loadingToggle(true);
              clickButton = true
              if (!(await CheckPermission(['CAMERA']))) {
                return setNotifyOpen_3(true);
              }
              navigation.navigate('QrCode');
            }
          }}>
          <Animated.View style={[styles.qr_tooltip, tooltipAnimationStyles]}>
            <View style={styles.qr_tooltip_arrow} />
            <Text style={styles.qr_tooltip_text}>{translate('please_confirm_qr_code')}</Text>
          </Animated.View>
          <Animated.View
            style={[styles.qr_animate, qrAnimationStyles]}>
            <Image
              source={require('../assets/qr_navigate.png')}
              resizeMode="contain"
              style={{ width: '50%', height: '50%', alignSelf: 'center' }}
            />
          </Animated.View>
        </Pressable>
        <View style={{ flex: 1 }} />
      </ImageBackground>
      <CustomNotification
        title={translate('notCameraPermission')}
        confirm_style={{ backgroundColor: '#666666' }}
        msg={
          <Text style={{ textAlign: 'center' }}>
            {translate('notCameraPermission_msg')}
          </Text>
        }
        modalOpen={notifyOpen_3}
        modalClose={() => {
          setNotifyOpen_3(false);
          clickButton = false
          loadingToggle(false);
        }}
      />
      <CustomNotification
        modalOpen={notifyOpen}
        modalClose={async () => {
          setNotifyOpen(false);
          navigation.replace('Setting');
        }}
        title={translate('register_auth')}
        msg={
          <>
            <Text style={styles.modal_msg}>
              {translate('2moreAuthRequired')}
            </Text>
            <Text style={styles.modal_msg}>{translate('GoToSetting')}</Text>
          </>
        }
      />
      <MenuSidebar opened={menuOpen} toggle={menuToggle} />
    </>
  );
};

function mapStateToProps(state) {
  const { isRoot, usbConnected, isForgery, firstSetting } = state;
  return {
    isLoading: state.isLoading,
    Authentications: state.Authentications,
    needUpdate: state.needUpdate,
    isRoot,
    usbConnected,
    isForgery,
    firstSetting,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    loadingToggle: (toggle) => {
      dispatch(ActionCreators.loadingToggle(toggle));
    },
    auth: (info) => {
      dispatch(ActionCreators.settingAuthentications(info));
    },
    auth_all: (info) => {
      dispatch(ActionCreators.settingAllAuthentications(info));
    },
    changeCurrentAuth: (auth) => {
      dispatch(ActionCreators.settingCurrentAuth(auth));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Home);
