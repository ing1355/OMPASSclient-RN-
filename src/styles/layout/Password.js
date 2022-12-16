import React from 'react';
import { StyleSheet } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { NotoSansRegular } from '../../env';

const styles = StyleSheet.create({
    container: {
        flex: 10,
        backgroundColor:'#ffffff'
    },
    guide_text: {
        fontSize: RFPercentage(2.8),
        letterSpacing: -1,
        textAlignVertical:'center'
    },
    err_msg: {
        textAlign: 'center', 
        alignSelf: 'center', 
        fontFamily: NotoSansRegular, 
        letterSpacing: -1, 
        color: 'red', 
        fontSize: RFPercentage(2)
    },
    guide_text_container: {
        flex: 1,
        flexDirection:'row',
        justifyContent:'center',
        paddingHorizontal:'10%'
    },
    input_container: {
        flex: 3,
        flexDirection:'row',
        paddingHorizontal:'10%'
    },
    footer_btn: {
        flex: 1,
        flexDirection:'column',
        justifyContent:'center'
    },
    footer_btn_text: {
        fontSize:RFPercentage(2.3),
        fontFamily:NotoSansRegular,
        letterSpacing: -1,
        color: '#3571d6',
        textAlign:'center'
    }
});

export default styles;
