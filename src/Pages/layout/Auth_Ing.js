import React, { useEffect, useState, useRef } from 'react';
import { Text, View, Image } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { connect } from 'react-redux';
import { translate } from '../../../App';
import { Circle } from '../../Components';
import ActionCreators from '../../global_store/actions';
import styles from '../../styles/layout/Auth_Ing';

const Auth_Ing = (props) => {
    const [count, setCount] = useState(0);
    useEffect(() => {
        const unsubscribe = props.navigation.addListener('focus', () => {
            props.loadingToggle(false);
        });

        return unsubscribe;
    }, [props.navigation])

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

    useInterval(() => {
        setCount(count => count + 1);
    }, 500)

    useEffect(() => {
        if (props.route.params) {
            setTimeout(() => {
                props.route.params.callback()
            }, 100);
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