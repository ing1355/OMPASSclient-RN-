import React, { useState, useEffect } from 'react';
import { Text, View, Image, Pressable } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { connect } from 'react-redux';
import { translate } from '../../../App';
import CustomOpacityButton from '../../Components/CustomOpacityButton';
import { NotoSansRegular } from '../../env';
import ActionCreators from '../../global_store/actions';
import styles from '../../styles/layout/Auth_Complete';

const Auth_Fail = (props) => {
    // props = {
    //     ...props,
    //     route: {
    //         params: {
    //             type: '인증',
    //             reason: '앱 재설치'
    //         }
    //     }
    // }
    useEffect(() => {
        const unsubscribe = props.navigation.addListener('focus', () => {
            setTimeout(() => {
                props.loadingToggle(false);
            }, 100);
        });

        return unsubscribe;
    }, [props.navigation])

    function errorHandling(msg) {
        if(translate(msg).includes('missing')) {
            return msg;
        } else {
            return translate(msg);
        }        
    }

    return (
        <>
            <View style={[styles.complete_icon_container, {
                justifyContent:'flex-end',
                marginBottom: 30
            }]}>
                <Image source={require('../../assets/info_red.png')} resizeMode='contain' style={{ width: '55%', height: '55%' }} />
            </View>
            <View style={[styles.container, {marginHorizontal : translate(props.route.params.type).length > 10 ? '5%' : '10%', top: 30}]}>
                <Text style={{ fontSize: RFPercentage(3), textAlign: 'center', fontFamily: 'NotoSans-Bold' }}>
                    {translate(props.route.params.type) + translate('authFail')}
                </Text>
                <Text style={{ textAlign: 'center', marginVertical: '5%', fontFamily: NotoSansRegular, color: '#666666' }}>
                    {translate('errorReason')} : {errorHandling(props.route.params.reason)}
                </Text>
                {props.route.params.reason === '앱 재설치' && <Text style={{ textAlign: 'center', marginVertical: '5%', fontFamily: NotoSansRegular, color: '#666666' }}>
                    {translate('OMPASSRegisterAgain')}
                </Text>}
            </View>
            <View style={{ flex: 0.6, flexDirection: 'column', justifyContent: 'flex-end' }}>
                <CustomOpacityButton style={{ height: 80, backgroundColor: '#3571d6', flexDirection: 'column', justifyContent: 'center' }} onPress={() => {
                    props.navigation.reset({ index: 0, routes: [{ name: 'HOME' }] });
                }}>
                    <Text style={{ textAlign: 'center', fontFamily: NotoSansRegular, fontSize: RFPercentage(2.5), color: '#ffffff' }}>
                        {translate('OK')}
                    </Text>
                </CustomOpacityButton>
            </View>
        </>
    )
}

function mapStateToProps(state) {
    return {
        isLoading: state.isLoading
    };
}

function mapDispatchToProps(dispatch) {
    return {
        loadingToggle: (toggle) => {
            dispatch(ActionCreators.loadingToggle(toggle));
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Auth_Fail);