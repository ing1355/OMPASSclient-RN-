import React, { useRef, useState, useEffect } from 'react'
import { Animated, Pressable, View, Text, Image } from 'react-native'
import { translate } from '../../../../App';
import styles from '../../../styles/Menu/Logs/LogItem';
import { logProfileHeight } from '../../../styles/Menu/Logs/LogProfile';
import LogProfile from './LogProfile';

const animationDuration = 250

const LogItem = ({ data }) => {
    const { domain, icon, datas } = data
    const [opened, setOpened] = useState(false)
    const [defaultImage, setDefaultImage] = useState(false)
    const animation = useRef(new Animated.Value(0)).current;
    const heightAnimation = useRef(new Animated.Value(0)).current;

    useEffect(() => {
        if (opened) {
            Animated.timing(heightAnimation, {
                toValue: 1,
                duration: 10,
                useNativeDriver: false,
            }).start()
            Animated.timing(animation, {
                toValue: 1,
                duration: animationDuration,
                useNativeDriver: true,
            }).start()
        } else {
            Animated.timing(heightAnimation, {
                toValue: 0,
                duration: 10,
                useNativeDriver: false,
            }).start()
            Animated.timing(animation, {
                toValue: 0,
                duration: animationDuration,
                useNativeDriver: true,
            }).start()
        }
    }, [opened])

    return <View style={styles.content_container}>
        <Pressable style={[styles.domain_container, {
            marginBottom: opened ? 10 : 0
        }]} onPress={() => {
            setOpened(!opened)
        }}>
            <View style={[styles.content_icon_container, {
                backgroundColor: defaultImage ? 'gray' : 'transparent'
            }]}>
                <Image source={defaultImage ? require('../../../assets/mark.png') : {
                    uri: (domain.startsWith('http') ? domain : "https://" + domain) + '/favicon.ico'
                }} onError={(evt) => {
                    setDefaultImage(true)
                }} resizeMode="contain" style={[styles.content_icon]} />
            </View>
            <View style={styles.content_sub_container}>
                <View style={styles.title_container}>
                    <Text style={styles.title_text} numberOfLines={1} ellipsizeMode="tail">
                        {domain}
                    </Text>
                </View>
            </View>
            <Animated.View style={[styles.arrow_container, {
                transform: [
                    {
                        rotateX: animation.interpolate({
                            inputRange: [0, 1],
                            outputRange: ['0deg', '-180deg']
                        })
                    }
                ],
            }]}>
                <Image source={require('../../../assets/log_arrow.png')} resizeMode="contain" style={styles.arrow} />
            </Animated.View>
        </Pressable>
        <Animated.View style={[styles.log_detail_container, {
            height: heightAnimation.interpolate({
                inputRange: [0, 1],
                outputRange: [0, datas.length * logProfileHeight]
            })
        }]}>
            {
                datas.map((data, ind) => <LogProfile key={ind} data={data} />)
            }
        </Animated.View>
    </View>
}

export default LogItem