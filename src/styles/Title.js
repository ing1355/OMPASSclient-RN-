import React from 'react';
import { StyleSheet } from 'react-native';
import { NotoSansRegular } from '../env';

const styles = StyleSheet.create({
    container: {
        zIndex: 2,
        height: 60,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems:'center',
        alignSelf: 'center',
        width: '100%',
        // backgroundColor: 'rgb(249,249,249)',
        backgroundColor: 'white',
        borderBottomColor: 'gray',
        borderBottomWidth: 0.5
    },
    btn_style: {
        width: 60,
        height: 60,
        justifyContent:'center',
        alignItems:'center'
    },
    title_text: {
        flex: 4,
        textAlignVertical: 'center',
        textAlign: 'center',
        fontFamily: NotoSansRegular,
        color:'black',
        letterSpacing: -1
    },
    btn_x: {
        width: 20,
        height: 20
    },
    btn_arrow: {
        transform: [
            {
                rotate: '90deg'
            }
        ],
        height: 20,
        width: 20,
        alignSelf:'center'
    }
});

export default styles;
