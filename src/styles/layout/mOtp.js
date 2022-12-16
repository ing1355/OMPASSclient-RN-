import React from 'react';
import { StyleSheet } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { NotoSansRegular } from '../../env';

const styles = StyleSheet.create({
    container: {
        flex: 10,
        paddingHorizontal:'10%',
        backgroundColor:'#ffffff',
        flexDirection:'column',
        justifyContent:'center'
    },
    guide_text_container: {
        flex: 2,
    },
    icon_container: {
        flex: 0.8,
        flexDirection:'column',
        justifyContent:'center'
    },
    guide_text: {
        flex:2,
        fontSize: RFPercentage(3),
        fontFamily:'NotoSans-Bold',
        textAlign:'center',
        letterSpacing: -1,
        textAlignVertical:'center'
    },
    lock_text: {
        flex:2.5,
        fontSize: RFPercentage(2),
        fontFamily:'NotoSans-Bold',
        textAlign:'center',
        letterSpacing: -1,
        textAlignVertical:'center',
        color:'red'
    },
    refresh_container: {
        flex:3,
    },
    refresh_text: {
        fontSize: RFPercentage(3),
        fontFamily:'NotoSans-Bold',
        textAlign:'center',
        letterSpacing: -1,
        textAlignVertical:'center',
        fontFamily: 'NotoSans-Bold',
        textDecorationLine: 'underline',
        color : '#39AEFD',
        alignSelf:'center'
    },
    modalText: {
        textAlign:'center',
        fontFamily:NotoSansRegular,
        letterSpacing: -1,
    },
    inputContainer: {
        flex: 0.3
    },
    input: {
        flex: 1,
        textAlign:'center',
        borderBottomWidth: 2,
        fontFamily: 'NotoSans-Bold',
        width: 150,
        alignSelf:'center',
        fontSize: RFPercentage(3)
    }
});

export default styles;
