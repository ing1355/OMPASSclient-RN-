import React from 'react';
import { StyleSheet } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { NotoSansRegular } from '../../env';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor:'white'
    },
    btn_x_view_container: {
        height: 80,
        alignItems:'flex-end',
        justifyContent:'center'
    },
    btn_x_container: {
        marginRight: 10,
        width: 60,
        height: 60,
        justifyContent:'center'
    },
    btn_x: {
        width:'60%',
        height:'60%',
        alignSelf:'center',
    },
    text_container: {
        flex: 1,
        justifyContent:'center',
    },
    guide_text_container: {
        height: 60,
        marginBottom: 45
    },
    error_text_container: {
        height: 60
    },
    circle_container: {
        flex: 1,
        zIndex: 1,
        justifyContent:'center',
        alignSelf:'center',
        width: '80%',
    },
    guide_text: {
        color:'black',
        fontSize: RFPercentage(2.8),
        letterSpacing: -1,
        textAlign:'center',
        fontFamily: NotoSansRegular
    },
    error_text: {
        fontFamily: NotoSansRegular,
        color:'red'
    },
    pattern_row: {
        flex: 1,
        flexDirection:'row',
    },
    pattern_col: {
        flex:1,
        flexDirection:'column',
        justifyContent:'center',
    },
});

export default styles;
