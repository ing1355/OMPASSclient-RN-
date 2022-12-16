import React from 'react';
import { Platform, StyleSheet } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { NotoSansRegular } from '../../env';

const styles = StyleSheet.create({
    list: {
        flex: 1,
        justifyContent: 'center'
    },
    list_item_container: {
        flex: 1,
    },
    list_item: {
        flex: 1,
        paddingHorizontal: '5%',
        borderBottomColor:'gray',
        flexDirection:'row',
        justifyContent:'space-between',
        alignItems:'center'
    },
    list_item_text: {
        fontFamily:NotoSansRegular,
        color:'black',
        fontSize: RFPercentage(2.1)
    }
});

export default styles;
