import React, { useState, useEffect, useRef } from 'react';
import { Text, View, Image, NativeModules, Animated, Easing, Platform } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { useDispatch, useSelector } from 'react-redux';
import { translate } from '../../../App';
import { NotoSansRegular } from '../../env';
import styles from '../../styles/layout/Auth_Complete';
import { loadingToggle } from '../../global_store/actions/loadingToggle';
import CustomOpacityButton from '../../Components/CustomOpacityButton';

let timerId = 0
const clearTime = 1
const animationDuration = 350

const Auth_Complete = (props) => {
    // props = {
    //     ...props,
    //     route: {
    //         params: 'Auth'
    //     }
    // }
    const {appSettings: {
        exitAfterAuth
    }} = useSelector(state => ({
        appSettings: state.appSettings
    }))
    // const exitAfterAuth = true
    const dispatch = useDispatch()
    const _loadingToggle = (toggle) => {
        dispatch(loadingToggle(toggle))
    }
    const [animationComplete, setAnimationComplete] = useState(false)
    // const [timerValue, setTimerValue] = useState(clearTime)
    const [text, setText] = useState('Regist');
    const animation = useRef(new Animated.Value(0)).current;
    const overlayAnimation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        const unsubscribe = props.navigation.addListener('focus', () => {
            setText(props.route.params);
            setTimeout(() => {
                _loadingToggle(false);
            }, 10);
            
            Animated.timing(animation, {
                toValue: 1,
                duration: animationDuration,
                easing: Easing.out(Easing.exp),
                useNativeDriver: true,
            }).start(() => {
                setAnimationComplete(true)
                Animated.timing(overlayAnimation, {
                    toValue: 1,
                    duration: animationDuration,
                    useNativeDriver: true,
                }).start()
            })
            if(Platform.OS === 'android' && exitAfterAuth && !props.route.params.includes('Regist')) {
                setTimeout(() => {
                    // clearInterval(timerId)
                    NativeModules.CustomSystem.ExitApp()
                }, clearTime * 1000 + animationDuration);
                // timerId = setInterval(() => {
                //     setTimerValue(timer => timer - 1)
                // }, 1000);
            }
        });

        return unsubscribe;
    }, [props.navigation])

    return (
        <>
        {/* <ImageBackground source={require('../../assets/bg.png')} style={{
            flex: 1
        }}> */}
            <View style={styles.complete_icon_container}>
                <View style={{flex: 0.45}}/>
                <View style={styles.complete_circle}>
                    <Animated.View style={[styles.complete_inner_circle, {
                        transform: [
                            {
                                scale: animation
                            }
                        ]
                    }]}/>
                    {animationComplete && <View style={styles.complete_check_icon_container}>
                        <Animated.View style={[styles.complete_check_icon_overlay,
                        {
                            transform: [
                                {
                                    translateX: overlayAnimation.interpolate({
                                        inputRange: [0,1],
                                        outputRange: [0, 100]
                                    })
                                }
                            ],
                        }]}/>
                        <Image source={require('../../assets/icon_complete.png')} resizeMode='contain' style={styles.complete_check_icon}/>
                    </View>}
                </View>
            </View>
            <View style={[styles.container, { marginHorizontal : translate(text).length > 10 && !text.includes('Regist') ? '5%' : '10%'}]}>
                <Text style={[styles.auth_text]}>
                    {text.includes("Regist") ? translate('completeOMPASSRegist') : translate('completeOMPASSAuth')}
                </Text>
                {/* {(exitAfterAuth && !props.route.params.includes("Regist")) && <Text style={styles.auth_sub_text}>
                    {timerValue}초 뒤에 자동으로 종료됩니다.
                </Text>} */}
            </View>
            {(Platform.OS === 'ios' || !exitAfterAuth || props.route.params.includes("Regist")) ? <View style={{ height: 80, flexDirection: 'column', justifyContent: 'flex-end' }}>
                <CustomOpacityButton style={{ height: '100%', backgroundColor: '#3571d6', flexDirection: 'column', justifyContent: 'center' }} onPress={() => {
                    props.navigation.reset({ index: 0, routes: [{ name: 'HOME' }] });
                }}>
                    <Text style={{ textAlign: 'center', fontFamily: NotoSansRegular, fontSize: RFPercentage(2.5), color: '#ffffff' }}>
                        {translate('OK')}
                    </Text>
                </CustomOpacityButton>
            </View> : <View style={{flex: 0.2}}/>}
        {/* </ImageBackground> */}
        </>
    )
}

export default Auth_Complete;