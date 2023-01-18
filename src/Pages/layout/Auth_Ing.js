import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Text, View, Image, BackHandler, Platform } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { connect } from 'react-redux';
import { translate } from '../../../App';
import { Circle } from '../../Components';
import ActionCreators from '../../global_store/actions';
import styles from '../../styles/layout/Auth_Ing';

function useInterval(callback, delay) {
    const savedCallback = useRef();

    // Remember the latest callback.
    useEffect(() => {
        savedCallback.current = callback;
    }, [callback]);

    // Set up the interval.
    useEffect(() => {
        function tick() {
            savedCallback.current();
        }
        if (delay !== null) {
            let id = setInterval(tick, delay);
            return () => clearInterval(id);
        }
    }, [delay]);
}

let intervalId = 0

const Auth_Ing = (props) => {
    // props = {
    //     ...props,
    //     route: {
    //         params: 'Auth'
    //     }
    // }
    const [count, setCount] = useState(0);
    const handleBackPress = useCallback(() => {
        return true;
    }, [])
    
    useEffect(() => {
        const unsubscribe = props.navigation.addListener('focus', () => {
            props.loadingToggle(false);
            if (Platform.OS === 'android') BackHandler.addEventListener('hardwareBackPress', handleBackPress)
        });

        const subscribeCancel = props.navigation.addListener('blur', () => {
            clearInterval(intervalId)
            if (Platform.OS === 'android') BackHandler.removeEventListener('hardwareBackPress', handleBackPress)
        });

        return () => {
            unsubscribe();
            subscribeCancel()
        }
    }, [props.navigation])

    useEffect(() => {
        const intervalHandler = () => {
            setTimeout(() => {
                setCount(count => count + 1)
                intervalHandler()
            }, 500);
        }
        intervalHandler()
        if (props.route.params) {
            setTimeout(() => {
                props.route.params.callback()
            }, 500);
        }
    }, [])

    return (
        <>
            <View style={{ flex: 0.1, top: '8%' }}>
                <Image style={styles.logo} source={require('../../assets/ompass_logo_color.png')} resizeMode='contain' />
            </View>
            <View style={styles.container}>
                <Text style={{ fontSize: RFPercentage(3.5) }}>
                    {translate(props.route.params.text) + translate('ing')}
                </Text>
                <Text style={{ textAlign: 'center', marginVertical: '5%', textDecorationLine: 'underline' }}>
                    {translate('wait')}
                </Text>
                <View style={{ alignSelf: 'center', flexDirection: 'row' }}>
                    {count % 3 >= 0 ? <Circle size={15} color='#3773d6' visible /> : <Circle size={15} color='#ffffff' visible={false} />}
                    {count % 3 >= 1 ? <Circle size={15} color='#558af1' visible /> : <Circle size={15} color='#ffffff' visible={false} />}
                    {count % 3 >= 2 ? <Circle size={15} color='#81afff' visible /> : <Circle size={15} color='#ffffff' visible={false} />}
                </View>
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

export default connect(mapStateToProps, mapDispatchToProps)(Auth_Ing);