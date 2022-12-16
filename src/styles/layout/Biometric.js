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
        flex: 1,
        flexDirection:'column',
        justifyContent:'center'
    },
    guide_text: {
        flex:2,
        bottom: 30,
        color: 'black',
        fontSize: RFPercentage(3),
        fontFamily: NotoSansRegular,
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
    }
});

export default styles;
