import { Text, View, Image, Animated, Pressable, ScrollView, SafeAreaView } from "react-native"
import { translate } from "../../../App"
import Title from "../../Components/Title"
import { useEffect, useState } from "react"
import AsyncStorage from "@react-native-async-storage/async-storage"
import { AsyncStorageLogKey } from "../../Constans/ContstantValues"
import totp from 'totp-generator'
import { useRef } from "react"
import { Base32Encode } from "../../Function/Base32"
import { RFPercentage } from "react-native-responsive-fontsize"
import { Pie, Circle } from 'react-native-progress'
import { NotoSansRegular } from "../../env"

const tick = 20
const rowHeight = 50
const radius = rowHeight * 0.5

const OTPItem = ({ data, opened, setOpened, isFirst }) => {
    const [progress, setProgress] = useState(0)
    const [otp, setOtp] = useState(null)
    const timerId = useRef(0)
    const intervalId = useRef(0)

    const clearTimers = () => {
        clearTimeout(timerId.current)
        clearInterval(intervalId.current)
    }

    useEffect(() => {
        if (!opened) {
            clearTimers()
        }
    }, [opened])

    const createOtp = (domain, userName, uuid = "") => {
        clearTimers()
        setProgress(0)
        setOtp(totp(Base32Encode(domain + userName + uuid), { period: tick }))
        intervalId.current = setInterval(() => {
            setProgress(per => per + (100 / tick) / 500)
        }, 200);
        timerId.current = setTimeout(() => {
            createOtp(domain, userName, uuid)
        }, 1000 * tick);
    }
    
    return <View style={{
        borderTopLeftRadius: 15,
        borderTopRightRadius: 15,
        marginTop: isFirst ? 0 : 20
    }}>
        <Text style={{
            height: 25,
            top: 5,
            left: 20,
            fontSize: RFPercentage(2),
            color: 'black',
        }}>
            {data.domain} ({data.users.length})
        </Text>
        {
            data.users.map((__, _ind) => {
                const username = __.alias || __.username
                return <Animated.View key={_ind} style={{
                    height: (opened === (data.domain + username)) ? (rowHeight * 2) : rowHeight,
                    // height: (opened === (data.domain + __)) ? heightAnimation.interpolate({
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
                        if (opened === (data.domain + username)) setOpened(null)
                        else {
                            createOtp(data.domain, __.username, __.uuid)
                            setOpened(data.domain + username)
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
                            fontWeight: (opened && opened.slice(data.domain.length,) === username) ? 'bold' : '300'
                        }}>
                            {username}
                        </Text>
                        <View style={{
                            width: radius,
                            height: radius,
                            borderRadius: radius / 2,
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}>
                            <Image
                                source={opened === (data.domain + username) ? require('../../assets/otpClose.png') : require('../../assets/otpOpen.png')}
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
                </Animated.View>
            })
        }
    </View>
}

const OTP = () => {
    const [listData, setListData] = useState([])
    const [opened, setOpened] = useState(null)
    const getLogDatas = async () => {
        const data = JSON.parse(await AsyncStorage.getItem(AsyncStorageLogKey))
        if (data) {
            setListData(data.map(_ => {
                return {
                    domain: _.domain,
                    users: _.datas
                }
            }))
        }
    }

    useEffect(() => {
        getLogDatas()
    }, [])

    return <>
        <Title
            title={translate('OTP_MENU_TITLE')}
            x
            style={{
                marginBottom: 10
            }} />
        {
            listData.length > 0 ? <SafeAreaView style={{
                flex: 1
            }}>
                <ScrollView contentInset={{
                    bottom: 40
                }}>
                    {
                        listData.map((_, ind) =>
                            <OTPItem key={ind} data={_} opened={opened} setOpened={setOpened} isFirst={ind === 0} />
                        )
                    }
                </ScrollView>
            </SafeAreaView> : <View style={{
                flex: .7,
                justifyContent: 'center',
                alignItems: 'center'
            }}>
                <Image source={require('../../assets/emptyLogIcon.png')} style={{
                    width: 80,
                    height: 80,
                    marginBottom: 30
                }} />
                <Text style={{
                    fontFamily: NotoSansRegular,
                    fontSize: RFPercentage(2.3)
                }}>
                    {translate('NoOTPData')}
                </Text>
            </View>
        }
    </>
}

export default OTP