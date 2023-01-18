import React from 'react';
import { StyleSheet } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { NotoSansRegular } from '../../../env';

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    empty_text: {
        fontFamily: NotoSansRegular,
        fontSize: RFPercentage(2.5)
    }
});

export default styles;
