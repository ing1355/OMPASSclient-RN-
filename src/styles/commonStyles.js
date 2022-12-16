import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { NotoSansRegular } from '../env';

const commonStyles = StyleSheet.create({
    settingRowContainerStyleByPlatform: {
        marginTop: '2.5%',
        paddingHorizontal: Platform.OS === 'android' ? 0 : '3%',
    },
    settingRowContentStyleByPlatform: {
        height: Platform.OS === 'android' ? 60 : 45,
        borderRadius: Platform.OS === 'android' ? 15 : 10,
        backgroundColor: 'white',
        justifyContent: 'center',
        overflow:'hidden'
    },
    settingRowContentSubContainerStyleByPlatform: {
        flex: 1,
        paddingHorizontal:'5%',
        flexDirection: Platform.OS === 'android' ? 'column' : 'row',
        justifyContent: Platform.OS === 'android' ? 'center' : 'space-between',
        alignItems: Platform.OS === 'android' ? 'flex-start' : 'center',
    },
    settingRowContentTextStyleByPlatform: {
        color: 'black',
        fontFamily: NotoSansRegular,
        fontSize: RFPercentage(2)
    }
});

export default commonStyles;