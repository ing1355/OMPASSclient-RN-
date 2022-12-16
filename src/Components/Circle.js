import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';

export default function Circle(props) {
  function degToRad(deg) {
    return deg * Math.PI / 180;
  }
  useEffect(() => {
  }, [])
  const { size, symbolSize } = props;

  const angleRad = degToRad(45);
  const radius = size / 2;
  const center = radius;

  // Calculate symbol position
  // Subtract half of symbol size to center it on the circle
  const x = radius * Math.cos(angleRad) + center - symbolSize / 2;
  const y = radius * Math.sin(angleRad) + center - symbolSize / 2;

  return (
    <View
      style={[s.circle, {
        width: size,
        height: size,
        borderRadius: size / 2,
        borderWidth: props.border && 10,
        borderColor: props.border ? 'green' : null,
        backgroundColor: props.border ? null : props.color,
        alignSelf: props.center && 'center'
      }, props.style]}
      onLayout={e => {
      }}
    >
      <Text style={s.circleCaption}>{props.text}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: '2%'
  },
  circleCaption: {
    fontSize: RFPercentage(3),
  }
});