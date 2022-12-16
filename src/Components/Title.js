import React, { useState } from 'react';
import { Text, Pressable, Image, KeyboardAvoidingView, View, Platform } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { connect } from 'react-redux';
import ActionCreators from '../global_store/actions';
import styles from '../styles/Title';
import * as RootNavigation from '../Route/Router';
import CustomButton from './CustomButton';

const Title = ({ style, onLayout, title, fontStyle, x_style, xcallback, xback, blackx, x, xcolor, back, noEffect, backRoute }) => {
    const [xpress, setXpress] = useState(false);
    return (
        <>
            <KeyboardAvoidingView keyboardVerticalOffset={1000} style={[styles.container, style]} onLayout={(e) => {
                onLayout ? onLayout(e) : null;
            }}>
                <CustomButton style={styles.btn_style} onPress={() => {
                    RootNavigation.goBack();
                }}>
                    {back && <Image style={styles.btn_arrow} source={require('../assets/log_arrow.png')} resizeMode='contain' />}
                </CustomButton>
                <Text style={[styles.title_text, fontStyle,
                {
                    fontSize: RFPercentage(title.length > 6 ?
                        title.length > 10 ? title.length > 20 ?
                            2 : 2.5 : 2.5 : 2.5)
                }]}>
                    {title}
                </Text>
                <CustomButton noEffect={noEffect} style={[styles.btn_style, x_style]} disabled={xpress} onPress={() => {
                    if (xcallback) {
                        xcallback();
                    } else {
                        if (!xpress) {
                            setXpress(true);
                            if (backRoute) RootNavigation.replace(backRoute)
                            else {
                                if (xback) RootNavigation.goBack();
                                else RootNavigation.reset();
                            }
                        }
                        // if (Platform.OS === 'android') loadingToggle(true);
                    }
                }}>
                    {x ? blackx ?
                        <Image style={styles.btn_x} source={require('../assets/black_x.png')} resizeMode='contain' /> :
                        xcolor === 'white' ?
                            <Image style={styles.btn_x} source={require('../assets/btn_x_white.png')} resizeMode='contain' /> :
                            <Image style={styles.btn_x} source={require('../assets/btn_x.png')} resizeMode='contain' /> :
                        null}
                </CustomButton>
            </KeyboardAvoidingView>

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

export default connect(mapStateToProps, mapDispatchToProps)(Title);