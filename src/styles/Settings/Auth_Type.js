import React from 'react';
import { StyleSheet } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { NotoSansRegular } from '../../env';

export const AuthTypeHeight = 80

const styles = StyleSheet.create({
    list_item: {
        height: AuthTypeHeight,
        borderBottomColor:'gray',
        flexDirection:'row',
        alignItems:'center',
        marginHorizontal:'5%'
    },
    list_item_text: {
        flex: 10,
        marginHorizontal:'3%',
        fontSize: RFPercentage(2),
    },
    list_button: {
    },
    modalText: {
        textAlign:'center',
        fontFamily:NotoSansRegular,
        letterSpacing: -1,
    }
});

export default styles;
