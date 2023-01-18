import React, { useEffect, useState, useRef, useMemo, useCallback, useLayoutEffect } from 'react';
import { Text, View, PanResponder, Platform, Image, Pressable, AppState } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { connect } from 'react-redux';
import { CustomConfirmModal, CustomNotification } from '../../Components/CustomAlert';
import Title from '../../Components/Title';
import ActionCreators from '../../global_store/actions';
import styles from '../../styles/layout/Pattern';
import { Surface, Shape, Path } from '@react-native-community/art';
import {
    AuthenticateErrorCountAdd,
    AuthenticateGetErrorCount,
    AuthenticateIsLock,
    AuthenticateLock,
    AuthenticateResetErrorCount,
    AuthSecurity
} from '../../Auth/Security';
import Pattern_Points from './Pattern_Points';
import { NotoSansRegular } from '../../env';
import { translate } from '../../../App';
import { getOtherAuthentication } from '../../Function/GetOtherAuthentication';
import { iosStatusBarHeight } from '../../Route/CustomStatusBar';
import * as RootNavigation from '../../Route/Router';

let id = 0;
const getNativeEventByPlatform = (nEvt) => {
    const { pageY } = nEvt
    return {
        ...nEvt,
        pageY: Platform.OS === 'android' ? pageY : (pageY - iosStatusBarHeight)
    }
}

const Pattern = (props) => {
    const [pattern_layout, setPattern_layout] = useState(null);
    const circle_size = 15;
    const [center_point, setCenter_point] = useState([[0, 0, 0], [0, 0, 0], [0, 0, 0]]);
    const [value, _setValue] = useState([]);
    const [value_confirm, setValue_confirm] = useState([]);
    const [length_error, setLength_error] = useState(false);
    const [wrong_value_error, setWrong_value_error] = useState(false);
    const [currentPosition, setCurrentPosition] = useState({
        x: 0,
        y: 0
    })
    const [isConfirm, setIsConfirm] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [modalOpen2, setModalOpen2] = useState(false);
    const [errorCount, setErrorCount] = useState(0);
    const [errorTimeStamp, setErrorTimeStamp] = useState(0);
    const [count, setCount] = useState(0);
    const [isAnimated, setIsAnimated] = useState(false)
    const isConfirmRef = useRef(isConfirm);
    const wrong_value = useRef(wrong_value_error);
    const patternLayout = useRef(pattern_layout);
    const isAnimatedRef = useRef(isAnimated);
    const valueRef = useRef(value);
    const valueConfirmRef = useRef(value_confirm);
    const getCircleByIndex = useCallback((index) => center_point[Math.floor(index / 3)][index % 3], [center_point])
    const lastPoint = useMemo(() => isConfirm ? (value_confirm.length > 0 ? getCircleByIndex(value_confirm.slice(-1,)[0]) : [0, 0]) : (value.length > 0 ? getCircleByIndex(value.slice(-1,)[0]) : [0, 0]), [getCircleByIndex, value, value_confirm, isConfirm])
    const lastPointRef = useRef(lastPoint);
    const countRef = useRef(count)

    useEffect(() => {
        isConfirmRef.current = isConfirm;
    }, [isConfirm])

    useLayoutEffect(() => {
        isAnimatedRef.current = isAnimated
    }, [isAnimated])

    useLayoutEffect(() => {
        lastPointRef.current = lastPoint
    }, [lastPoint])

    useLayoutEffect(() => {
        valueRef.current = value
    }, [value])

    useLayoutEffect(() => {
        countRef.current = count
    }, [count])

    useLayoutEffect(() => {
        valueConfirmRef.current = value_confirm
    }, [value_confirm])

    useEffect(() => {
        wrong_value.current = wrong_value_error;
    }, [wrong_value_error])

    useEffect(() => {
        patternLayout.current = pattern_layout;
    }, [pattern_layout])

    const ErrorCountCheckFunction = async () => {
        await AuthenticateGetErrorCount(async (count) => {
            setErrorCount(count);
        });
        await AuthenticateIsLock(async (timestamp) => {
            setErrorTimeStamp(timestamp);
        });

    }

    useEffect(() => {
        let AppStateListener
        const unsubscribe = props.navigation.addListener('focus', async () => {
            if (props.route.params.text !== 'first_regist') {
                ErrorCountCheckFunction()
                AppStateListener = AppState.addEventListener('change', (nextAppState) => {
                    if (nextAppState === 'active') {
                        ErrorCountCheckFunction()
                    } else {
                        setErrorCount(0)
                        setErrorTimeStamp(0)
                        clearInterval(id);
                    }
                })
            } else {
                setErrorCount(0);
                setErrorTimeStamp(0);
            }
            setTimeout(() => {
                props.loadingToggle(false);
            }, 100);
        });
        const blursubscribe = props.navigation.addListener('blur', () => {
            if(props.route.params && props.route.params.cancelCallback) props.route.params.cancelCallback()
            setTimeout(() => {
                init_all_value();
                setIsConfirm(false);
            }, 100);
            if (AppStateListener) AppStateListener.remove()
            setCount(-1);
            clearInterval(id);
        })
        return () => {
            unsubscribe();
            blursubscribe();
        }
    }, [props.navigation])

    useEffect(() => {
        if (errorCount > 4) {
            const dif_timestamp = parseInt(errorTimeStamp) - Math.floor(Date.now() / 1000);
            if (dif_timestamp > 0) {
                setModalOpen2(true);
                setCount(dif_timestamp);
                clearInterval(id);
                id = setInterval(() => {
                    setCount(count => count - 1);
                }, 1000);
            }
        }
    }, [errorTimeStamp])

    const setValue = (val) => {
        if (isConfirmRef.current) {
            setValue_confirm(val)
        } else {
            _setValue(val)
        }
    }

    function getCirclePoint(x, y) { // 터치한 좌표에서 distance 거리 내에 있는 원의 정보 반환
        let temp = null;
        let distance = 0;
        for (let i = 0; i < center_point.length; i++) {
            const arr = center_point[i]
            for (let j = 0; j < arr.length; j++) {
                const sub_arr = arr[j]
                distance = getDistance(x - patternLayout.current.x, y - patternLayout.current.y, sub_arr[0], sub_arr[1]);
                if (distance < 30) {
                    temp = {
                        coords: center_point[i][j],
                        index: i * 3 + j
                    }
                    break;
                }
            }
            if (temp !== null) break;
        }
        return temp;
    }

    function getDistance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    function init_all_value() {
        _setValue([])
        setValue_confirm([])
    }

    function length_check() {
        let temp = isConfirmRef.current ? valueConfirmRef.current : valueRef.current;
        if (temp.length < 4) {
            if (temp.length > 0) setLength_error(true);
            if (isConfirmRef.current) {
                setValue_confirm([])
            } else {
                setValue([])
            }
            return false;
        }
        return true;
    }

    function value_check() {
        if (valueRef.current.toString() !== valueConfirmRef.current.toString()) {
            setWrong_value_error(true)
            setValue_confirm([])
            return false;
        }
        return true;
    }

    function Authenticate_Error() {
        AuthenticateErrorCountAdd(async (errorCount) => {
            setErrorCount(errorCount);
            if (errorCount > 4) {
                setWrong_value_error(false);
                setLength_error(false);
                AuthenticateLock(errorCount);
                await AuthenticateIsLock(async (timestamp) => {
                    setErrorTimeStamp(timestamp);
                })
            }
        });
        setWrong_value_error(true);
        init_all_value();
    }

    const panResponder = React.useRef(
        PanResponder.create({
            onStartShouldSetPanResponder: (evt, gestureState) => {
                if (countRef.current < 1) {
                    setLength_error(false);
                    setWrong_value_error(false);
                    const { pageX, pageY } = getNativeEventByPlatform(evt.nativeEvent)
                    const result = getCirclePoint(pageX, pageY)
                    if (result) {
                        setValue([result.index])
                        setIsAnimated(true)
                    }
                } else {
                    const { pageX, pageY } = getNativeEventByPlatform(evt.nativeEvent)
                    const result = getCirclePoint(pageX, pageY)
                    if (result) {
                        setModalOpen2(true)
                    }
                }
                return true;
            },
            onPanResponderMove: (evt, gestureState) => {
                if (countRef.current < 1) {
                    const { pageX, pageY } = getNativeEventByPlatform(evt.nativeEvent)
                    const result = getCirclePoint(pageX, pageY)
                    if (patternLayout.current && isAnimatedRef.current) {
                        const { x, y, width, height } = patternLayout.current
                        setCurrentPosition({
                            x: (pageX >= x && pageX <= x + width) ? (pageX - x) : (pageX < x ? 0 : width),
                            y: (pageY >= y && pageY <= y + height) ? (pageY - y) : (pageY < y ? 0 : height)
                        })
                        const _value = isConfirmRef.current ? valueConfirmRef.current : valueRef.current
                        if (result && !_value.includes(result.index)) {
                            const temp = _value
                            const lastValue = temp.slice(-1,)[0]
                            if (
                                (Math.abs(lastValue - result.index) === 2 && Math.floor(lastValue / 3) === Math.floor(result.index / 3)) // 가로 끝과 끝을 이었을 때
                                || (Math.abs(lastValue - result.index) === 6) && (lastValue % 3 === result.index % 3)) { // 세로 끝과 끝을 이었을 때
                                temp.push((lastValue + result.index) / 2)
                            } else if (Math.abs(lastValue - result.index) === 8) { // 대각선 끝과 끝 이었을 때
                                temp.push((lastValue + result.index) / 2)
                            }
                            setValue(temp.concat(result.index))
                        }
                    } else {
                        if (result && !isAnimatedRef.current) {
                            setValue([result.index])
                            setIsAnimated(true)
                        }
                    }
                }
            },
            onPanResponderRelease: async (evt, gestureState) => {
                if (countRef.current < 1) {
                    setIsAnimated(false)
                    setCurrentPosition({
                        x: 0,
                        y: 0
                    })
                    if (!length_check()) {
                        return;
                    }
                    if (props.route.params.text === 'first_regist') {
                        if (!isConfirmRef.current) {
                            setIsConfirm(true);
                        } else {
                            if (!value_check()) return;
                            AuthSecurity(valueRef.current.toString(), "pattern", "등록", (suc) => {
                                if (suc === 'success') {
                                    if (Platform.OS === 'ios') props.loadingToggle(false);
                                    setModalOpen(true);
                                }
                            })
                        }
                    } else if (props.route.params.text === 'local_Authenticate') {
                        AuthSecurity(valueRef.current.toString(), "pattern", "인증", (suc) => {
                            if (suc === 'success') {
                                AuthenticateResetErrorCount();
                                init_all_value();
                                setIsConfirm(false);
                                props.route.params.callback();
                            }
                        }, () => {
                            Authenticate_Error();
                        })
                    } else {
                        AuthSecurity(valueRef.current.toString(), "pattern", "인증", (suc) => {
                            if (suc === 'success') {
                                AuthenticateResetErrorCount();
                                init_all_value();
                                setIsConfirm(false);
                                props.navigation.replace('Auth_Ing', { callback: props.route.params.callback, text: props.route.params.text });
                            }
                        }, () => {
                            Authenticate_Error();
                        })
                    }
                }
            },
        })
    ).current;

    return (
        <View style={styles.container} {...panResponder.panHandlers}>
            <Title
                x
                title={translate('pattern')}
                backRoute={props.route.params.text === 'first_regist' ? 'Setting' : 'HOME'}/>
            <View style={styles.text_container}>
                <View style={styles.guide_text_container}>
                    {isConfirm ? <Text style={styles.guide_text}>
                        {translate('patternAgain')}
                    </Text> : <Text style={styles.guide_text}>
                            {translate('patternDraw')}
                        </Text>}
                </View>
                <View style={styles.error_text_container}>
                    {length_error && <Text style={[styles.guide_text, styles.error_text]}>
                        {translate('patternNeed4Points')}
                    </Text>}
                    {wrong_value_error && isConfirm && <Text style={[styles.guide_text, styles.error_text]}>
                        {translate('patternNotMatch')}
                    </Text>}
                    {wrong_value_error && !isConfirm && <Text style={[styles.guide_text, styles.error_text]}>
                        {translate('patternNotMatch')} ({errorCount}/5)
                    </Text>}
                    {errorCount > 4 && count > 0 && <Text style={[styles.guide_text, styles.error_text]}>
                        {translate('patternLock')}({count}{translate('Lock_time')})
                    </Text>}
                </View>
            </View>
            <View style={styles.circle_container} onLayout={(e) => {
                setPattern_layout(e.nativeEvent.layout)
            }}>
                {pattern_layout && isAnimated && ((!isConfirm && value.length > 0) || (isConfirm && value_confirm.length > 0)) &&
                    <Surface width='100%' height='100%' style={{ position: 'absolute', zIndex: 2 }}>
                        {(currentPosition.x > 0 || currentPosition.y > 0) && <Shape
                            d={new Path().moveTo(lastPoint[0], lastPoint[1]).lineTo(currentPosition.x, currentPosition.y)}
                            stroke="black"
                            strokeWidth={3}
                        />}
                        {
                            !isConfirm && value.length > 1 && props.route.params.text === 'first_regist' && value.slice(0, -1).map((v, ind) => <Shape
                                key={v}
                                d={new Path().moveTo(getCircleByIndex(v)[0], getCircleByIndex(v)[1]).lineTo(getCircleByIndex(value[ind + 1])[0], getCircleByIndex(value[ind + 1])[1])}
                                stroke="black"
                                strokeWidth={3}
                            />)
                        }
                        {
                            isConfirm && value_confirm.length > 1 && value_confirm.slice(0, -1).map((v, ind) => <Shape
                                key={v}
                                d={new Path().moveTo(getCircleByIndex(v)[0], getCircleByIndex(v)[1]).lineTo(getCircleByIndex(value_confirm[ind + 1])[0], getCircleByIndex(value_confirm[ind + 1])[1])}
                                stroke="black"
                                strokeWidth={3}
                            />)
                        }
                    </Surface>}
                <View style={styles.pattern_row} pointerEvents='none'>
                    <Pattern_Points circle_size={circle_size} center_point={center_point} setCenter_point={setCenter_point} row={0} col={0} />
                    <Pattern_Points circle_size={circle_size} center_point={center_point} setCenter_point={setCenter_point} row={0} col={1} />
                    <Pattern_Points circle_size={circle_size} center_point={center_point} setCenter_point={setCenter_point} row={0} col={2} />
                </View>
                <View style={styles.pattern_row} pointerEvents='none'>
                    <Pattern_Points circle_size={circle_size} center_point={center_point} setCenter_point={setCenter_point} row={1} col={0} />
                    <Pattern_Points circle_size={circle_size} center_point={center_point} setCenter_point={setCenter_point} row={1} col={1} />
                    <Pattern_Points circle_size={circle_size} center_point={center_point} setCenter_point={setCenter_point} row={1} col={2} />
                </View>
                <View style={styles.pattern_row} pointerEvents='none'>
                    <Pattern_Points circle_size={circle_size} center_point={center_point} setCenter_point={setCenter_point} row={2} col={0} />
                    <Pattern_Points circle_size={circle_size} center_point={center_point} setCenter_point={setCenter_point} row={2} col={1} />
                    <Pattern_Points circle_size={circle_size} center_point={center_point} setCenter_point={setCenter_point} row={2} col={2} />
                </View>
            </View>
            <View style={{ flex: 0.3 }} />

            <CustomNotification
                modalOpen={modalOpen}
                modalClose={() => {
                    setModalOpen(false);
                }}
                title={props.route.params.text === 'first_regist' ? translate('patternRegist') : null}
                msg={<Text
                    style={{ fontSize: RFPercentage(2), fontFamily: NotoSansRegular, textAlign: 'center' }}>
                    {props.route.params.text === 'first_regist' ? translate('patternRegistSuccess') : null}
                </Text>}
                callback={() => {
                    props.route.params.callback();
                    props.loadingToggle(false);
                }} />
            <CustomConfirmModal
                title={translate('isLock')}
                msg={
                    <Text style={{ textAlign: 'center' }}>
                        {translate('changeToOtherAuth')}
                    </Text>
                }
                modalOpen={modalOpen2}
                modalClose={() => {
                    setModalOpen2(false);
                }}
                cancelCallback={() => {
                    // if (props.route.params.text !== 'first_regist') RootNavigation.reset();
                }}
                callback={async () => {
                    if(!getOtherAuthentication({ ...props, ...props.route.params, type: 'pattern' })) {
                        props.navigation.replace('HOME')
                    }
                }}
            />
        </View>
    )
}

function mapStateToProps(state) {
    return {
        isLoading: state.isLoading,
        Authentications: state.Authentications,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        loadingToggle: async (toggle) => {
            dispatch(ActionCreators.loadingToggle(toggle));
        },
        changeNotificationToggle: (auth) => {
            dispatch(ActionCreators.changeNotificationToggle(auth));
        },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Pattern);