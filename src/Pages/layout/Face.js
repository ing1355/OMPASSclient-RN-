import React, { useEffect, useState } from 'react';
import { Text, View, Image, NativeModules, AppState } from 'react-native';
import { connect } from 'react-redux';
import * as RootNavigation from '../../Route/Router';
import Title from '../../Components/Title';
import ActionCreators from '../../global_store/actions';
import styles from '../../styles/layout/Biometric';
import { CustomConfirmModal, CustomNotification } from '../../Components/CustomAlert';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CheckPermission } from '../../Components/CheckPermissions';
import { translate } from '../../../App';
import { getOtherAuthentication } from '../../Function/GetOtherAuthentication';
import { AsyncStorageAuthenticationsKey, AsyncStorageCurrentAuthKey } from '../../Constans/ContstantValues';

let subscription

const Face = (props) => {
    const [construct, setConstruct] = useState(true);
    const [isLock, setIsLock] = useState(false);
    const [notSetUp, setNotSetUp] = useState(false);
    const [notAvailable, setNotAvailable] = useState(false);
    const [failAuthenticate, setFailAuthenticate] = useState(false);
    const [changeModalOpen, setChangeModalOpen] = useState(false);
    const [changedModalOpen, setChangedModalOpen] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);

    const appStateChangeFunc = async (nextAppState) => {
        if (nextAppState === 'active') {
            await run_biometric()
        }
    }

    useEffect(() => {
        const unsubscribe = props.navigation.addListener('focus', async () => {
            props.loadingToggle(false);
            subscription = AppState.addEventListener('change', appStateChangeFunc)
            CheckPermission(['FACE']);
        });

        const subscribe = props.navigation.addListener('blur', async () => {
            if(props.route.params && props.route.params.cancelCallback) props.route.params.cancelCallback()
            subscription.remove()
            Init_Error();
        });

        return () => {
            unsubscribe();
            subscribe();
        }
    }, [props.navigation])

    async function FaceIDSuccessFunc() {
        const { text, callback } = props.route.params;
        if (text === 'local_Authenticate' || text === 'first_regist') {
            callback();
        } else {
            const params = {
                callback: () => {
                    callback();
                },
                text: text
            };
            RootNavigation.replace('Auth_Ing', params);
        }
    }

    function Init_Error() {
        setIsLock(false);
        setNotSetUp(false);
    }

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
        Init_Error();
        const { Biometrics, LocalAuth } = NativeModules.webAuthn;
        const { text } = props.route.params;
        Biometrics(translate('Tryface'), text, async (cal) => {
            switch (cal) {
                case 'success':
                    FaceIDSuccessFunc();
                    break;
                case 'Face ID/Touch ID is locked.':
                    setIsLock(true);
                    if (text !== 'first_regist') setChangeModalOpen(true);
                    break;
                case 'Face ID/Touch ID is not available.':
                    setNotAvailable(true);
                    if (text !== 'first_regist') return setChangeModalOpen(true);
                    break;
                case 'There was a problem verifying your identity.':
                    setFailAuthenticate(true);
                    if (text !== 'first_regist') return setChangeModalOpen(true);
                    break;
                case 'Face ID/Touch ID is not set up.':
                    if (text === 'first_regist') {
                        setNotSetUp(true);
                        break;
                    }
                    if (text !== 'first_regist') {
                        delete_biometric();
                        return setDeleteModalOpen(true)
                    }
                case 'changed':
                    delete_biometric();
                    if (text !== 'first_regist') setChangedModalOpen(true);
                    break;
                default: break;
            }
        })
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
                title={translate('face')}
                backRoute={props.route.params.text === 'first_regist' ? 'Setting' : 'HOME'}/>
            <View style={styles.container}>

                <View style={styles.icon_container}>
                    <Image source={require('../../assets/icon_face.png')} resizeMode='contain' style={{ width: '40%', height: '40%', alignSelf: 'center' }} />
                </View>
                <View style={styles.guide_text_container}>
                    <Text style={styles.guide_text}>
                        {translate('proceedFace')}
                    </Text>
                    <Text style={styles.lock_text}>
                        {isLock ? translate('faceLock') + "\n" : null}
                        {notSetUp ? translate('faceNotSetUp') : null}
                        {notAvailable ? translate('faceNotAvailable') + "\n" : null}
                        {notAvailable ? translate('faceNotAuth') : null}
                        {failAuthenticate ? translate('faceFail') : null}
                        {isLock ? translate('lockScreenAgain') : null}
                    </Text>
                    <View style={styles.refresh_container}>
                        {!notAvailable && !isLock && <Text style={styles.refresh_text} onPress={() => {
                            run_biometric();
                        }}>
                            {translate('tryAgain')}
                        </Text>}
                    </View>
                    <View style={{ flex: 6 }} />
                </View>
            </View>
            <CustomConfirmModal
                title={translate('notNowAuth_title')}
                msg={
                    <>
                        <Text style={styles.modalText}>
                            {translate('faceFail')}
                        </Text>
                        <Text style={styles.modalText}>
                            {translate('changeToOtherAuth')}
                        </Text>
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
                    if(!getOtherAuthentication({ ...props, ...props.route.params, type: 'biometrics' })) props.navigation.replace('HOME');
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
                }}
                callback={() => {
                    setChangeModalOpen(true);
                }}
            />
            <CustomNotification
                title={translate('biometricInfoError')}
                msg={
                    <>
                        <Text style={styles.modalText}>
                            {translate('biometricChanged')}
                        </Text>
                        <Text style={styles.modalText}>
                            {translate('biometricChanged_msg')}
                        </Text>
                    </>
                }
                modalOpen={changedModalOpen}
                modalClose={() => {
                    setChangedModalOpen(false);
                }}
                callback={() => {
                    setChangeModalOpen(true);
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
        auth: (info) => {
            dispatch(ActionCreators.settingAuthentications(info))
        },
        auth_all: async (info) => {
            dispatch(ActionCreators.settingAllAuthentications(info))
        },
        changeCurrentAuth: async (auth) => {
            dispatch(ActionCreators.settingCurrentAuth(auth));
        },
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Face);