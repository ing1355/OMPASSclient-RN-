import { Text, View, Image, Animated, Pressable } from "react-native"
import { translate } from "../../../App"
import Title from "../../Components/Title"
import { useEffect, useState } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { AsyncStorageLogKey } from "../../Constans/ContstantValues"
import totp from 'totp-generator'
import { useRef } from "react"
import { Base32Encode } from "../../Function/Base32"
import { Buffer } from 'buffer'
import CustomOpacityButton from "../../Components/CustomOpacityButton"
import { RFPercentage } from "react-native-responsive-fontsize"
import { Pie, Circle } from 'react-native-progress'

const tick = 20
let timerId = 0
let intervalId = 0
const rowHeight = 50
const radius = rowHeight * 0.5

const clearTimers = () => {
    clearTimeout(timerId)
    clearInterval(intervalId)
}

const OTP = () => {
    const [listData, setListData] = useState([])
    const [progress, setProgress] = useState(0)
    const [otp, setOtp] = useState(null)
    const [opened, setOpened] = useState(null)
    const openedRef = useRef(opened)

    const getLogDatas = async () => {
        const data = JSON.parse(await AsyncStorage.getItem(AsyncStorageLogKey))
        if (data) {
            setListData(data.map(_ => {
                return {
                    domain: _.domain,
                    users: _.datas.map(__ => __.username)
                }
            }))
        }
    }

    useEffect(() => {
        getLogDatas()
        return () => {
            clearTimers()
        }
    }, [])

    useEffect(() => {
        if (!opened) {
            clearTimers()
        }
        openedRef.current = opened
    }, [opened])

    const createOtp = (domain, userName) => {
        clearTimeout(timerId)
        clearInterval(intervalId)
        setProgress(0)
        setOtp(totp(Base32Encode(Buffer.from(domain + userName, 'utf8')), { period: tick }))
        intervalId = setInterval(() => {
            setProgress(per => per + (100 / tick) / 500)
        }, 200);
        timerId = setTimeout(() => {
            createOtp(domain, userName)
        }, 1000 * tick);
    }

    return <>
        <Title
            title={translate('OTP_MENU_TITLE')}
            x
            style={{
                marginBottom: 10
            }} />
        {
            listData.map((_, ind) => <View key={ind} style={{
                borderTopLeftRadius: 15,
                borderTopRightRadius: 15,
                marginTop: ind === 0 ? 0 : 20
            }}>
                <Text style={{
                    height: 25,
                    top: 5,
                    left: 20,
                    fontSize: RFPercentage(2),
                    color: 'black',
                }}>
                    {_.domain} ({_.users.length})
                </Text>
                {
                    _.users.map((__, _ind) => <Animated.View key={_ind} style={{
                        height: (opened === (_.domain + __)) ? (rowHeight * 2) : rowHeight,
                        // height: (opened === (_.domain + __)) ? heightAnimation.interpolate({
                        //     inputRange: [0, 1],
                        //     outputRange: [rowHeight, rowHeight * 2]
                        // }) : rowHeight,
                        marginTop: _ind !== 0 ? 5 : 10,
                        backgroundColor: 'white',
                        borderRadius: 15,
                        overflow: 'hidden',
                    }}>
                        <Pressable style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingHorizontal: 25,
                            height: rowHeight
                        }} onPress={() => {
                            if (opened === (_.domain + __)) setOpened(null)
                            else {
                                createOtp(_.domain, __)
                                setOpened(_.domain + __)
                            }
                        }}>
                            <Text style={{
                                flex: 1.5,
                                color: 'black',
                            }}>
                                ID
                            </Text>
                            <Text style={{
                                flex: 6,
                                color: 'black',
                                fontWeight: (opened && opened.slice(_.domain.length,) === __) ? 'bold' : '300'
                            }}>
                                {__}
                            </Text>
                            <View style={{
                                width: radius,
                                height: radius,
                                borderRadius: radius / 2,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}>
                                <Image
                                    source={opened === (_.domain + __) ? require('../../assets/otpClose.png') : require('../../assets/otpOpen.png')}
                                    resizeMode="contain"
                                    style={{ height: rowHeight * 0.4 }}
                                />
                            </View>
                        </Pressable>
                        <View style={{
                            height: rowHeight,
                            flexDirection: 'row',
                            alignItems: 'center',
                            paddingHorizontal: 25,
                        }}>
                            <Text style={{
                                flex: 1.5,
                                color: 'black',
                            }}>
                                OTP
                            </Text>
                            <Text style={{
                                flex: 6,
                                fontWeight: 'bold',
                                color: '#0965FC',
                                fontSize: RFPercentage(3.5)
                            }}>
                                {otp && (otp.slice(0, 3) + '  ' + otp.slice(3,))}
                            </Text>
                            <Pie style={{
                                transform: [
                                    {
                                        rotateZ: '180deg'
                                    }
                                ]
                            }} size={radius} animated={false} unfilledColor="#0965FC" progress={progress} color="white" borderColor="white" borderWidth={radius} />
                        </View>
                    </Animated.View>)
                }
            </View>)
        }
    </>
}

export default OTP