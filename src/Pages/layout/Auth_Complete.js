import React, { useState, useEffect, useRef } from 'react';
import { Text, View, Image, NativeModules, Animated, Easing, Platform, AppState } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { useDispatch, useSelector } from 'react-redux';
import { translate } from '../../../App';
import { NotoSansRegular } from '../../env';
import styles from '../../styles/layout/Auth_Complete';
import { loadingToggle } from '../../global_store/actions/loadingToggle';
import CustomOpacityButton from '../../Components/CustomOpacityButton';
import * as RootNavigation from '../../Route/Router'
import { CustomSystem } from '../../Function/NativeModules';

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
    const appState = useRef(AppState.currentState);
    const backgroundChanged = useRef(false)
    
    useEffect(() => {
        const unsubscribe = props.navigation.addListener('focus', () => {
            backgroundChanged.current = false
            setText(props.route.params.type);
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
                }).start(() => {
                    if(props.route.params.callback) props.route.params.callback()
                })
            })
            if(Platform.OS === 'android' && exitAfterAuth && !props.route.params.type.includes('Regist')) {
                const handleAppStateChange = next => {
                    if(appState.current === 'active' && next === 'background') {
                        backgroundChanged.current = true
                    }
                }
                AppState.addEventListener('change', handleAppStateChange)
                setTimeout(() => {
                    if(!backgroundChanged.current) CustomSystem.ExitApp()
                    else RootNavigation.reset()
                }, clearTime * 1000 + animationDuration);
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
            </View>
            {(Platform.OS === 'ios' || !exitAfterAuth || props.route.params.type.includes("Regist")) ? <View style={{ height: 80, flexDirection: 'column', justifyContent: 'flex-end' }}>
                <CustomOpacityButton style={{ height: '100%', backgroundColor: '#3571d6', flexDirection: 'column', justifyContent: 'center' }} onPress={() => {
                    const stateInfo = props.navigation.getState()
                    if(!stateInfo || stateInfo.routes.length === 1) RootNavigation.reset()
                     else props.navigation.goBack();
                }}>
                    <Text style={{ textAlign: 'center', fontFamily: NotoSansRegular, fontSize: RFPercentage(2.5), color: '#ffffff' }}>
                        {translate('OK')}
                    </Text>
                </CustomOpacityButton>
            </View> : <View style={{flex: 0.2}}/>}
        </>
    )
}

export default Auth_Complete;