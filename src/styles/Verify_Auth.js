import React from 'react';
import { StyleSheet } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';

const styles = StyleSheet.create({
    title: {
        color: 'red',
        flex: 1,
        justifyContent: 'center'
    },
    title_text: {
        alignSelf: 'center',
        fontSize: RFPercentage(5)
    },
    contents: {
        flex: 6,
        alignSelf:'center'
    },
    container: {
        flex: 1
    },
    circle : {
        alignSelf:'center'
    }
});

export default styles;
