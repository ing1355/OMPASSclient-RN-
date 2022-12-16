import React, { useState } from 'react';
import { View, Pressable, PanResponder } from 'react-native';
import { Circle } from '../../Components';
import styles from '../../styles/layout/Pattern';

const Pattern_Points = (props) => {
    const { circle_size, setCenter_point, row, col, center_point } = props;
    return (
        <View style={styles.pattern_col} onLayout={e => {
            const {width, height} = e.nativeEvent.layout;
            let temp = center_point;
            temp[row][col] = [(col*width) + (width/2), (row*height) + (height/2)]
            setCenter_point(temp);
        }}>
            <View style={styles.circle_container} >
                <Circle size={circle_size} color="black" style={{ alignSelf: 'center', justifyContent: 'center' }} />
            </View>
        </View>
    )
}

export default Pattern_Points;