import React from 'react';
import { StyleSheet, Platform } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { settingRowContainerStyleByPlatform, settingRowContentStyleByPlatform } from '../../Constans/ContstantValues';
import { NotoSansRegular } from '../../env';

const radius = 80
const boderWidth = 4

const styles = StyleSheet.create({
    container: {
        flex: 10,
    },
    setting_item_row_text: {
        color: 'black',
        fontFamily: NotoSansRegular,
        fontSize: RFPercentage(2)
    },
    setting_value_container: {
        flexDirection:'row',
        alignItems:'center'
    },
    setting_value_text_android: {
        fontSize: RFPercentage(2),
        marginRight: 10,
        color: '#0381FD'
    },
    setting_value_text_ios: {
        fontSize: RFPercentage(2.3),
        marginRight: 10,
        color: '#888888'
    },
    setting_arrow_img: {
        height: 20,
        width: 12
    }
});

export default styles;
