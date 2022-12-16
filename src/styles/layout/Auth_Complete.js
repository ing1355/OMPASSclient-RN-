import React from 'react';
import { StyleSheet } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';

const radius = 80
const boderWidth = 10

const styles = StyleSheet.create({
    complete_icon_container: {
        flex: 1,
        alignItems:'center',
        justifyContent: 'center'
    },
    complete_circle: {
        width: radius * 2,
        height: radius * 2,
        borderRadius: radius,
        justifyContent:'center',
        alignItems:'center',
        backgroundColor:'rgb(57,174,253)'
    },
    complete_inner_circle: {
        width: radius * 2 - boderWidth,
        height: radius * 2 - boderWidth,
        borderRadius: radius,
        backgroundColor: 'white',
        position: 'absolute',
        zIndex: 3
    },
    complete_progress_circle: {
        width: radius * 2,
        height: radius * 2,
        borderRadius: radius,
        position:'absolute',
        backgroundColor:'gray',
        zIndex: 1
    },
    complete_progress_circle_right: {
        width: radius,
        height: radius * 2,
        borderRadius: radius,
        borderTopLeftRadius: 0,
        borderBottomLeftRadius: 0,  
        position:'absolute',
        backgroundColor:'gray',
        zIndex: 4
    },
    complete_check_icon_container: {
        width: radius,
        height: radius,
        position: 'absolute',
        zIndex : 3,
        overflow:'hidden',
    },
    complete_check_icon_overlay: {
        position:'absolute',
        width:'100%',
        height:'100%',
        backgroundColor:'white',
        zIndex: 2,
    },
    complete_check_icon: {
        width:'100%',
        height:'100%',
        zIndex: 1
    },
    container: {
        flex: 1,
        marginHorizontal:'10%',
    },
    auth_text : {
        fontSize: RFPercentage(3),
        fontFamily: 'NotoSans-Bold',
        color: 'rgb(57,174,253)',
        textAlign: 'center',
        flex: 2
    },
    auth_sub_text: {
        flex: 1,
        fontSize: RFPercentage(2.5), 
        textAlign:'center'
    }
});

export default styles;
