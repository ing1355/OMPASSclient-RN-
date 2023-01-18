import React, { useState } from 'react';
import { useRef } from 'react';
import { useEffect } from 'react';
import {
  Animated,
  Image,
  Pressable,
  View,
  Text,
  Platform,
  Easing,
  Linking,
} from 'react-native';
import { local_auth } from '../../Auth/LocalAuthenticate';
import styles, { menuWidth } from '../../styles/Menu/Menu';
import { Menu_First_Item } from './MenuItems';
import * as RootNavigation from '../../Route/Router';
import { translate } from '../../../App';
import { getVersion, getBuildNumber } from 'react-native-device-info';
import * as RNLocalize from 'react-native-localize';
import CustomOpacityButton from '../../Components/CustomOpacityButton';

const animationDuration = 725

const createTimingAnimation = (animation, option) => Animated.timing(animation, {
  easing: Easing.out(Easing.exp),
  duration: animationDuration,
  useNativeDriver: true,
  ...option,
})

const MenuSidebar = ({ opened, toggle }) => {
  const [
    currentAuthSettingModalOpen,
    setCurrentAuthSettingModalOpen,
  ] = useState(false);
  const animation = useRef(new Animated.Value(1)).current;
  const backgroundAnimation = useRef(new Animated.Value(0)).current;
  const openedRef = useRef(opened)
  
  const animationInterpolation = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 150, menuWidth]
  })
  const animationCloseInterpolation = animation.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 150, menuWidth]
  })
  const animationStyles = {
    transform: [{ translateX: animationInterpolation }],
  };
  const animationCloseStyles = {
    transform: [{ translateX: animationCloseInterpolation }],
  };
  
  const backgroundAnimationStyle = {
    opacity: backgroundAnimation,
  };

  useEffect(() => {
    if (!openedRef.current && opened) {
      createTimingAnimation(backgroundAnimation, {
        toValue: 0.6,
        duration: animationDuration
      }).start()
      createTimingAnimation(animation, {
        toValue: 0
      }).start()
    } else if(openedRef.current && !opened) {
      createTimingAnimation(backgroundAnimation, {
        toValue: 0,
      }).start()
      createTimingAnimation(animation, {
        toValue: 1,
        duration: animationDuration,
      }).start()
    }
    openedRef.current = opened
  }, [opened]);

  return (
    <>
      <Animated.View
        style={{ ...styles.menu_container, ...backgroundAnimationStyle }}
        pointerEvents={opened ? 'auto' : 'none'}>
        <Pressable style={{ flex: 1 }} onPress={toggle} />
      </Animated.View>
      <Animated.View style={[styles.menu_sidebar, opened ? animationStyles : animationCloseStyles]}>
        <View style={styles.menu_title}>
          <Pressable style={styles.logo}>
            <Image
              source={require('../../assets/ompass_logo_color.png')}
              resizeMode="contain"
              style={{ width: '100%', height: '100%' }}
            />
          </Pressable>
        </View>
        <View style={styles.menu_contents}>
          <CustomOpacityButton
            style={styles.menu_button}
            onPress={() => {
              setCurrentAuthSettingModalOpen(true);
            }}>
            <View style={styles.menu_item}>
              <Image
                source={require('../../assets/currentAuthSettingIcon.png')}
                resizeMode="contain"
                style={styles.menu_item_icon}
              />
              <Text style={styles.menu_item_text}>
                {translate('authSetting')}
              </Text>
              <Menu_First_Item
                modalOpen={currentAuthSettingModalOpen}
                setModalOpen={setCurrentAuthSettingModalOpen}
              />
            </View>
          </CustomOpacityButton>
          <CustomOpacityButton
            style={styles.menu_button}
            onPress={() => {
              toggle();
              local_auth();
            }}>
            <View style={styles.menu_item}>
              <Image
                source={require('../../assets/localAuthSettingIcon.png')}
                resizeMode="contain"
                style={styles.menu_item_icon}
              />
              <Text style={styles.menu_item_text}>{translate('authChange')}</Text>
            </View>
          </CustomOpacityButton>
          <CustomOpacityButton
            style={styles.menu_button}
            onPress={() => {
              toggle();
              RootNavigation.navigate('AppSetting');
            }}>
            <View style={styles.menu_item}>
              <Image
                source={require('../../assets/icon_setting.png')}
                resizeMode="contain"
                style={styles.menu_item_icon}
              />
              <Text style={styles.menu_item_text}>
                {translate('AppSetting')}
              </Text>
            </View>
          </CustomOpacityButton>
          <CustomOpacityButton
            style={styles.menu_button}
            onPress={() => {
              toggle();
              RootNavigation.navigate('Logs');
            }}>
            <View style={styles.menu_item}>
              <Image
                source={require('../../assets/registerationInfo.png')}
                resizeMode="contain"
                style={styles.menu_item_icon}
              />
              <Text style={styles.menu_item_text}>
                {translate('RegistrationInformation')}
              </Text>
            </View>
          </CustomOpacityButton>
          <CustomOpacityButton
            style={styles.menu_button}
            onPress={() => {
              if (RNLocalize.getLocales()[0].languageCode === 'ko') {
                Linking.openURL(`https://ompasscloud.com/ko/document/${Platform.OS}`)
              } else {
                Linking.openURL(`https://ompasscloud.com/en/document/${Platform.OS}`)
              }
            }}>
            <View style={styles.menu_item}>
              <Image
                source={require('../../assets/helpIcon.png')}
                resizeMode="contain"
                style={styles.menu_item_icon}
              />
              <Text style={styles.menu_item_text}>
                {translate('HelpTitle')}
              </Text>
            </View>
          </CustomOpacityButton>
        </View>
        <Pressable style={styles.feedback_container} onPress={() => {
          if (RNLocalize.getLocales()[0].languageCode === 'ko') {
            Linking.openURL(`https://docs.google.com/forms/d/e/1FAIpQLSf_S5Av-D6IHzEWFufFhAqicBuMmGafxHFcY6IJKXM_44xzlw/viewform?usp=pp_url&entry.1778377264=${Platform.OS === 'android' ? 'Android' : 'iOS'}&entry.249062392=${getVersion()}(${getBuildNumber()})`)
          } else {
            Linking.openURL(`https://docs.google.com/forms/d/e/1FAIpQLSewSB0utBAyC7yEnlyCMACtlyEPZ16B5F63VoJJKPI_hOIW-Q/viewform?usp=pp_url&entry.234588716=${Platform.OS === 'android' ? 'Android' : 'iOS'}&entry.1086283936=${getVersion()}(${getBuildNumber()})`)
          }
        }}>
          <Text style={styles.feedback_text}>
            {translate('SendFeedBack')}
          </Text>
        </Pressable>
        <Text style={styles.version_text}>
          {`${getVersion()}(${getBuildNumber()})`}
        </Text>
      </Animated.View>
    </>
  );
};

export default MenuSidebar;
