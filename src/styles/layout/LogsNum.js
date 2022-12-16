import React from 'react';
import { Platform, StyleSheet } from 'react-native';

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    row_container: {
        height: Platform.OS === 'android' ? 61 : 46,
        width:'90%',
        flexDirection:'row',
        alignItems:'center',
        alignSelf:'center',
        justifyContent:'space-between',
        borderColor: 'rgba(192,192,192,.4)',
    },
    check_icon: {
        height: '80%',
        width: 20
    }
});

export default styles;
