import React from 'react';
import { StyleSheet } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { NotoSansRegular } from '../../../env';

export const logProfileHeight = 290

const titleTextColor = 'rgb(137,137,137)'
const textColor = 'rgb(51,51,51)'

const styles = StyleSheet.create({
    log_detail_profile_container: {
        borderTopWidth: 1.5,
        borderTopColor: 'rgba(168,168,168,0.7)',
        height: logProfileHeight,
        paddingVertical: 10
    },
    log_detail_profile_row_container: {
        height: 30,
        flexDirection: 'row'
    },
    log_detail_profile_row_title: {
        flex: 0.7,
        color: titleTextColor
    },
    log_detail_profile_row_description: {
        flex: 3,
        color: textColor
    },
    log_detail_logs_scroll_container: {
    },
    log_detail_logs_item_container: {
        height: 130,
        borderWidth: 1,
        borderColor: 'gray',
        borderRadius: 12,
        paddingVertical: 10,
        paddingHorizontal: 10,
        width: 130,
        backgroundColor: 'white'
    },
    log_detail_logs_text: {
        textAlign: 'center',
        fontFamily: NotoSansRegular,
        fontSize: 14,
        color:textColor,
        letterSpacing: -0.5
    },
    log_detail_logs_authenticate_result_text_container: {
        height: 30,
        marginVertical: 5,
        justifyContent: 'center',
    },
    log_detail_logs_authenticate_result_text: {
        fontFamily: 'NotoSans-Bold',
        fontSize: RFPercentage(1.8),
    },
    log_detail_logs_authenticate_icon: {
        alignSelf: 'center',
        width: 20,
        height: 20,
    }
});

export default styles;
