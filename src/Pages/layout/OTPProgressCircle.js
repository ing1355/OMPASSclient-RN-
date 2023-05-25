import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';

const ProgressCircle = ({ radius, strokeWidth, progress }) => {
  const circleRef = useRef(null);
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedValue, {
      toValue: progress,
      duration: 1000, // 애니메이션 지속 시간 (1초)
      useNativeDriver: true,
    }).start();
  }, [animatedValue, progress]);

  const circumference = 2 * Math.PI * radius;
  const progressValue = animatedValue.interpolate({
    inputRange: [0, 100],
    outputRange: [circumference, 0],
    extrapolate: 'clamp',
  });

  return (
    <View style={styles.container}>
      <View style={[styles.circle, { width: radius * 2, height: radius * 2 }]}>
        <Animated.View
          ref={circleRef}
          style={[
            styles.progressCircle,
            {
              width: (radius - strokeWidth) * 2,
              height: (radius - strokeWidth) * 2,
              borderRadius: radius - strokeWidth,
              borderWidth: strokeWidth,
              borderColor: 'gray',
              transform: [{ rotate: '-90deg' }],
              borderBottomColor: 'blue',
              borderStyle: 'solid',
              overflow: 'hidden',
            },
            {
              transform: [
                {
                  rotateZ: animatedValue.interpolate({
                    inputRange: [0, 100],
                    outputRange: ['-90deg', '270deg'],
                  }),
                },
              ],
            },
          ]}
        >
          <Animated.View
            style={[
              styles.fill,
              {
                width: (radius - strokeWidth) * 2,
                height: (radius - strokeWidth) * 2,
                borderRadius: radius - strokeWidth,
                backgroundColor: 'blue',
                transform: [
                  {
                    translateX: animatedValue.interpolate({
                      inputRange: [0, 100],
                      outputRange: [0, (radius - strokeWidth) * 2],
                    }),
                  },
                ],
              },
            ]}
          />
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  circle: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  progressCircle: {
    position: 'absolute',
    top: 0,
    start: 0,
  },
  fill: {
    position: 'absolute',
    top: 0,
    start: 0,
  },
});

export default ProgressCircle;