import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState, useCallback } from 'react';
import { Text, View, Platform, Image } from 'react-native';
import { connect } from 'react-redux';
import { CustomNotification } from '../../Components/CustomAlert';
import Title from '../../Components/Title';
import ActionCreators from '../../global_store/actions';
import styles from '../../styles/Settings/Setting';
import Setting_List from './Setting_List';
import { translate } from '../../../App';
import { BackHandler } from 'react-native';
import { AsyncStorageIosTypeKey } from '../../Constans/ContstantValues';

const Setting = ({ auth_all, changeCurrentAuth, route, loadingToggle, navigation, Authentications }) => {
    // const [modalOpen, setModalOpen] = useState(false);
    const [notifyOpen, setNotifyOpen] = useState(false);
    const list_title = ['biometrics', 'pin', 'pattern'];
    const [iosType, setIosType] = useState('fingerprint');
    
    const handleBackButton = useCallback(() => {
        if (!Authentications) return true;
        let count = 0;
        Object.keys(Authentications).map(key => {
            if (Authentications[key]) count++;
        })
        if (count < 2) return true;
        return false;
    },[])

    useEffect(() => {
        const unsubscribe = navigation.addListener('focus', async () => {
            if (Platform.OS === 'android') BackHandler.addEventListener('hardwareBackPress', handleBackButton);
            setIosType(await AsyncStorage.getItem(AsyncStorageIosTypeKey));
            loadingToggle(false);
        });

        const subscribe = navigation.addListener('blur', async () => {
            if (Platform.OS === 'android') BackHandler.removeEventListener('hardwareBackPress',handleBackButton)
        });

        return () => {
            unsubscribe()
            subscribe()
        }
    }, [navigation])

    return (
        <>
            <Title x title={translate('authChangeTitle')} xcallback={() => {
                let count = 0;
                Object.keys(Authentications).map(key => {
                    if (Authentications[key]) count++;
                })
                if (count < 2) {
                    Platform.OS === 'android' ? setNotifyOpen(true) :
                        setTimeout(() => {
                            setNotifyOpen(true);
                        }, 100);
                } else {
                    navigation.reset({ index: 0, routes: [{ name: 'HOME' }] });
                }
            }} />
            <View style={styles.container}>
                <View style={[styles.content_container, {
                    height: list_title.length * 60,
                    overflow:'hidden'
                }]}>
                    <Setting_List list={list_title} iosType={iosType} navigation={navigation}/>
                </View>
                <View style={styles.notice_container}>
                    <View style={[styles.notice_contents_container, {
                        paddingHorizontal: 0
                    }]}>
                        <Image style={styles.icon} source={require('../../assets/info_blue.png')} resizeMode='contain'/>
                        <Text style={styles.notice_title}>
                            {translate('notice')}
                        </Text>
                    </View>
                    <View style={styles.notice_contents_container}>
                        <Text style={styles.notice_contents}>
                            •
                        </Text>
                        <Text style={[styles.notice_contents, { marginLeft: '2%' }]}>
                            {translate('notice_msg_1')}
                        </Text>
                    </View>
                    <View style={styles.notice_contents_container}>
                        <Text style={styles.notice_contents}>
                            •
                        </Text>
                        <Text style={[styles.notice_contents, { marginLeft: '2%' }]}>
                            {translate('notice_msg_2')}
                        </Text>
                    </View>
                </View>
            </View>
            <CustomNotification
                modalOpen={notifyOpen}
                modalClose={() => { setNotifyOpen(false) }}
                title={translate('register_auth')}
                msg={
                    <Text style={styles.modal_msg}>
                        {translate('2moreAuthRequired')}
                    </Text>
                } />
        </>
    )
}

function mapStateToProps(state) {
    return {
        isLoading: state.isLoading,
        Authentications: state.Authentications,
        iosType: state.iosType
    };
}

function mapDispatchToProps(dispatch) {
    return {
        loadingToggle: (toggle) => {
            dispatch(ActionCreators.loadingToggle(toggle));
        },
        auth: async (info) => {
            await dispatch(ActionCreators.settingAuthentications(info))
        },
        auth_all: async (info) => {
            await dispatch(ActionCreators.settingAllAuthentications(info))
        },
        changeCurrentAuth: async (auth) => {
            await dispatch(ActionCreators.settingCurrentAuth(auth));
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Setting);