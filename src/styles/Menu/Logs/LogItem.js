import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { NotoSansRegular } from '../../../env';

const styles = StyleSheet.create({
    content_container: {
        backgroundColor: 'rgba(168,168,168,0.1)',
        borderRadius: 12,
        justifyContent: 'space-evenly',
        marginBottom: 15,
        paddingHorizontal: 8,
        paddingVertical: 8
    },
    domain_container: {
        height: 48,
        flexDirection: 'row',
        alignItems:'center'
    },
    content_icon_container: {
        height: 48,
        width: 48,
        borderRadius: 8,
        padding: 4,
        justifyContent:'center'
    },
    content_icon: {
        height: '90%',
        width: '90%',
        alignSelf:'center'
    },
    content_sub_container: {
        flex: 1,
        justifyContent: 'center',
        paddingLeft: 15
    },
    title_container: {
    },
    title_text: {
        color: 'black',
        fontSize: RFPercentage(2),
        fontFamily: 'NotoSans-Bold',
        letterSpacing: -0.5
    },
    arrow_container: {
        height: 48,
        width: 48,
        justifyContent: 'center',
        padding: 4,
    },
    arrow: {
        width: '60%',
        height: '60%',
        alignSelf: 'center'
    },
    log_detail_container: {
        overflow: 'hidden',
        height: 'auto'
    }
});

export default styles;
