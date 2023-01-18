import React, { useEffect, useState } from 'react';
import { Text, View, Image, NativeModules } from 'react-native';
import { connect } from 'react-redux';
import * as RootNavigation from '../../Route/Router';
import Title from '../../Components/Title';
import ActionCreators from '../../global_store/actions';
import styles from '../../styles/layout/Biometric';
import { CustomConfirmModal, CustomNotification } from '../../Components/CustomAlert';
import { translate } from '../../../App';
import { getOtherAuthentication } from '../../Function/GetOtherAuthentication';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AsyncStorageAuthenticationsKey, AsyncStorageCurrentAuthKey } from '../../Constans/ContstantValues';

const Biometric = (props) => {
    const [construct, setConstruct] = useState(true);
    const [isLock, setIsLock] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);
    const [enrollModalOpen, setEnrollModalOpen] = useState(false);
    const [changeModalOpen, setChangeModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [lockModalOpen, setLockModalOpen] = useState(false);
    
    useEffect(() => {
        const unsubscribe = props.navigation.addListener('focus', async () => {
            props.loadingToggle(false);
        });

        const subscribe = props.navigation.addListener('state', () => {
            run_biometric()
        })

        const blurHandler = props.navigation.addListener('blur', async () => {
            if(props.route.params && props.route.params.cancelCallback) props.route.params.cancelCallback()
            subscribe()
            unsubscribe()
        });

        return () => {
            blurHandler()
        }
    }, [props.navigation])

    async function delete_biometric() {
        let obj = {};
        obj['biometrics'] = false;
        await props.auth(obj);
        let temp = JSON.parse(await AsyncStorage.getItem(AsyncStorageAuthenticationsKey));
        temp['biometrics'] = false;
        await AsyncStorage.setItem(AsyncStorageAuthenticationsKey, JSON.stringify(temp));
        if (await AsyncStorage.getItem(AsyncStorageCurrentAuthKey) === 'biometrics') {
            let next_auth = '';
            Object.keys(temp).map(key => {
                if (temp[key] && next_auth === '') {
                    next_auth = key;
                }
            })
            await props.changeCurrentAuth(next_auth.length ? next_auth : '');
            await AsyncStorage.setItem(AsyncStorageCurrentAuthKey, next_auth.length ? next_auth : '');
        }
    }

    async function run_biometric() {
        const { biometric } = NativeModules.webAuthn;
        const { text, callback } = props.route.params;
        setIsLock(false);
        if (text === 'local_Authenticate' || text === 'first_regist') {
            return biometric(translate('biometrics'), (suc) => {
                console.log(suc);
                text === 'first_regist' ? setModalOpen(true) : callback();
            }, (err) => {
                console.log(err);
                if (err === '생체 인증 잠금!') {
                    if (text === 'first_regist') {
                        setIsLock(true);
                    }
                    else {
                        setIsLock(true);
                        setLockModalOpen(true);
                    }
                } else if (err === '등록된 생체 인증 정보가 존재하지 않습니다.') {
                    if(text === 'first_regist') setEnrollModalOpen(true);
                    else setDeleteModalOpen(true);
                    delete_biometric();
                }
            });
        } else {
            const params = {
                callback: () => {
                    callback();
                },
                text: text
            };
            return biometric(translate('biometrics'), (suc) => {
                // AuthenticateResetErrorCount();
                RootNavigation.replace('Auth_Ing', params);
            }, (err) => {
                console.log(err);
                if (err === '생체 인증 잠금!') {
                    setIsLock(true);
                    setLockModalOpen(true);
                } else if (err === '등록된 생체 인증 정보가 존재하지 않습니다.') {
                    setDeleteModalOpen(true);
                    delete_biometric();
                }
            });
        }
    }

    useEffect(() => {
        async function constructor() {
            await run_biometric();
            setConstruct(false);
        }
        if (construct) constructor();
    }, [])

    return (
        <>
            <Title
                x
                title={translate('biometrics')}
                xback
                // backRoute={props.route.params.text === 'first_regist' ? 'Setting' : 'HOME'}
                />
            <View style={styles.container}>
                <View style={styles.icon_container}>
                    <Image source={require('../../assets/icon_biometric.png')} resizeMode='contain' style={{ width: '40%', height: '40%', alignSelf: 'center' }} />
                </View>
                <View style={styles.guide_text_container}>
                    <Text style={styles.guide_text}>
                        {translate('proceedBiometric')}
                    </Text>
                    <Text style={styles.lock_text}>
                        {isLock ? translate('authLockError_msg') : null}
                    </Text>
                    <View style={styles.refresh_container}>
                        <Text style={styles.refresh_text} onPress={() => {
                            run_biometric();
                        }}>
                            {translate('tryAgain')}
                        </Text>
                    </View>
                    <View style={{ flex: 6 }} />
                </View>
            </View>
            <CustomNotification
                modalOpen={modalOpen}
                modalClose={() => {
                    setModalOpen(false);
                }}
                title={translate('biometricRegist')}
                msg={<Text
                    style={styles.modalText}>
                    {translate('biometricRegistSuccess')}
                </Text>}
                callback={() => {
                    props.route.params.callback();
                    props.loadingToggle(false);
                }} />
            <CustomConfirmModal
                title={translate('isLock')}
                msg={
                    <>
                        <>
                        <Text style={styles.modalText}>
                            {translate('biometricLock_msg_1')}
                        </Text>
                        <Text style={styles.modalText}>
                            {translate('changeToOtherAuth')}
                        </Text>
                    </>
                    </>
                }
                modalOpen={lockModalOpen}
                modalClose={() => {
                    setLockModalOpen(false);
                }}
                cancelCallback={() => {
                }}
                callback={() => {
                    if(!getOtherAuthentication({...props,...props.route.params,type:'biometrics'})) props.navigation.replace('HOME');
                }}
            />
            <CustomConfirmModal
                title={translate('biometricsFail')}
                msg={
                    <>
                        <>
                        <Text style={styles.modalText}>
                            {translate('biometricsFail_msg_1')}
                        </Text>
                        <Text style={styles.modalText}>
                            {translate('changeToOtherAuth')}
                        </Text>
                    </>
                    </>
                }
                modalOpen={changeModalOpen}
                modalClose={() => {
                    setChangeModalOpen(false);
                }}
                cancelCallback={() => {
                    // if (props.route.params.text !== 'first_regist') RootNavigation.reset();
                }}
                callback={() => {
                    getOtherAuthentication({...props,...props.route.params,type:'biometrics'});
                }}
            />
            <CustomNotification
                title={translate('biometricInfoError')}
                msg={
                    <>
                        <Text style={styles.modalText}>
                            {translate('biometricDelete')}
                        </Text>
                        <Text style={styles.modalText}>
                            {translate('biometricChanged_msg')}
                        </Text>
                    </>
                }
                modalOpen={deleteModalOpen}
                modalClose={() => {
                    setDeleteModalOpen(false);
                    setChangeModalOpen(true);
                }}
            />
            <CustomConfirmModal
                title={translate('biometricInfoError')}
                msg={
                    <>
                        <Text style={styles.modalText}>
                            {translate('biometricInfoError_msg_1')}
                        </Text>
                        <Text style={styles.modalText}>
                            {translate('biometricInfoError_msg_2')}
                        </Text>
                    </>
                }
                modalOpen={enrollModalOpen}
                modalClose={() => {
                    setEnrollModalOpen(false);
                }}
                cancelCallback={() => {
                    if (props.route.params.text === 'first_regist') props.navigation.goBack();
                    else setDeleteModalOpen(true);
                }}
                callback={() => {
                    NativeModules.webAuthn.EnrollBiometric();
                    setEnrollModalOpen(false);
                }}
            />
        </>
    )
}

function mapStateToProps(state) {
    return {
        isLoading: state.isLoading,
        Authentications: state.Authentications,
    }
}

function mapDispatchToProps(dispatch) {
    return {
        loadingToggle: (toggle) => {
            dispatch(ActionCreators.loadingToggle(toggle));
        },
        changeNotificationToggle: (auth) => {
            dispatch(ActionCreators.changeNotificationToggle(auth));
        },
        auth: (info) => {
            dispatch(ActionCreators.settingAuthentications(info))
        },
        changeCurrentAuth: async (auth) => {
            dispatch(ActionCreators.settingCurrentAuth(auth));
        },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Biometric);