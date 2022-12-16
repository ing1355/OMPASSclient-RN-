import React, { useRef } from 'react'
import { Animated, Pressable } from 'react-native'

const animationDuration = 300

const CustomButton = ({ style, onPress, children, noEffect }) => {
    const clicked = useRef(false)
    const animation = useRef(new Animated.Value(0)).current;
    const animationStyle = {
        opacity: animation,
        transform: [
            {
                scale: animation.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.5, 1]
                })
            }
        ]
    }

    const onPressIn = () => {
        if (!noEffect) {
            Animated.timing(animation, {
                toValue: 1,
                useNativeDriver: true,
                duration: animationDuration
            }).start()
        }
    }

    const onPressOut = () => {
        if (!noEffect) {
            Animated.timing(animation, {
                toValue: 0,
                useNativeDriver: true,
                duration: 1
            }).start()
        }
    }

    return <Pressable style={[{
        position: 'relative',
    }, style]} onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
        {children}
        {!noEffect && <Animated.View style={[animationStyle, {
            backgroundColor: 'rgba(192,192,192,.6)',
            width: '85%',
            height: '85%',
            borderRadius: 9999,
            position: 'absolute'
        }]} />}
    </Pressable>
}

export default CustomButton