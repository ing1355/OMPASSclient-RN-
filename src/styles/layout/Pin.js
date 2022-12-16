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
        color:'black',
        letterSpacing: -1,
        textAlignVertical:'center',
        textAlign:'center',
        fontFamily: NotoSansRegular
    },
    guide_error_text: {
        color: '#ff0000', 
        fontFamily: NotoSansRegular, 
        letterSpacing: -1, 
        fontSize: RFPercentage(2.2),
        textAlign:'center'
    },
    guide_text_container: {
        flex: 3,
        flexDirection:'row',
        justifyContent:'center',
        alignItems:'flex-end',
    },
    input_container: {
        flex: 3,
        justifyContent:'center',
        alignItems:'center'
    },
    pin_container: {
        paddingHorizontal:'15%',
        flex: 2,
        flexDirection:'row',
        justifyContent:'space-between'
    },
    error_container: {
        flex: 2,
        top: 5,
    },
    keypad_row: {
        flex: 1,
        // borderWidth: 0.2,
        // borderColor:'rgba(51,51,51,0.1)',
        flexDirection:'row'
    },
    keypad_col: {
        flex: 1,
        // borderWidth: 0.2,
        // borderColor:'rgba(51,51,51,0.1)',
        flexDirection:'column',
        justifyContent:'center'
    },
    keypad_text: {
        fontSize: RFPercentage(4.5),
        textAlign:'center',
        fontFamily:NotoSansRegular,
        color: '#151515',
        letterSpacing:-1
    },
    pin_input_layout: {
        flex: 9
    }
});

export default styles;
