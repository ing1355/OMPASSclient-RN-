import React, { useRef } from 'react'
import { Animated, Pressable, Platform, Easing } from 'react-native'

const animationDuration = Platform.OS === 'android' ? 200 : 1

const CustomOpacityButton = ({ style, onPress, children, disabled }) => {
    const animation = useRef(new Animated.Value(0)).current;
    const animationStyle = {
        opacity: animation.interpolate({
            inputRange: [0, 1],
            outputRange: [0, 1]
        }),
        transform: [
            {
                scaleX: animation
            }
        ]
    }

    const pressInAnimation = Animated.timing(animation, {
        toValue: 1,
        useNativeDriver: true,
        duration: animationDuration,
        easing: Easing.out(Easing.exp),
    })

    const pressOutAnimation = Animated.timing(animation, {
        toValue: 0,
        useNativeDriver: true,
        duration: 1
    })

    const onPressIn = () => {
        pressInAnimation.start()
    }

    const onPressOut = () => {
        pressOutAnimation.start()
    }

    return <Pressable style={[{
        position: 'relative', overflow: 'hidden'
    }, style]} disabled={disabled} onPress={onPress} onPressIn={onPressIn} onPressOut={onPressOut}>
        {children}
        <Animated.View style={[animationStyle, {
            backgroundColor: 'rgba(192,192,192,.4)',
            width: '100%',
            height: '100%',
            position: 'absolute'
        }]} />
    </Pressable>
}

export default CustomOpacityButton