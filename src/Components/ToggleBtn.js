import React, { useEffect, useRef } from 'react'
import { Animated, Pressable, Text, View } from 'react-native'
import styles from '../styles/Components/ToggleBtn'

const animationConfig = {
    duration: 150,
    useNativeDriver: true,
}

const ToggleBtn = ({ checked, style }) => {
    const animation = useRef(new Animated.Value(0)).current;
    useEffect(() => {
        if (checked) {
            Animated.timing(animation, { toValue: 1, ...animationConfig }).start()
        } else {
            Animated.timing(animation, { toValue: 0, ...animationConfig }).start()
        }
    }, [checked])
    return <View pointerEvents="none" style={[styles.toggle_container, checked ? {
        backgroundColor: '#0381FD',
    } : {
            backgroundColor: '#AAAAAA',
        }, style]}>
        <Animated.View style={[styles.toggle_bar, checked ? {
            borderColor: '#0678e9',
        } : {
                borderColor: '#999999',
            }, {
            transform: [{
                translateX: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0, 14]
                })
            }],
        }]} />
    </View>
}

export default ToggleBtn