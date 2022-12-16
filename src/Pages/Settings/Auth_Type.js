import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useRef, useState } from 'react';
import { View, Text, Image, Pressable, Platform, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import { translate } from '../../../App';
import ActionCreators from '../../global_store/actions';
import styles from '../../styles/Settings/Auth_Type';
import Icon from 'react-native-vector-icons/Ionicons';
import { NotoSansRegular } from '../../env';
import { CustomConfirmModal } from '../../Components/CustomAlert';
import { AsyncStorageCurrentAuthKey } from '../../Constans/ContstantValues';
import CustomOpacityButton from '../../Components/CustomOpacityButton';

const Auth_Type = (props) => {
    const [confirmModalOpen, setConfirmModalOpen] = useState(false);
    var modalCallback = useRef(null);
    
    const img_src = {
        biometrics: <Image style={{ flex: 1 }} resizeMode='contain' source={require("../../assets/icon_biometric.png")} />,
        pin: <Image style={{ flex: 1 }} resizeMode='contain' source={require("../../assets/icon_pin.png")} />,
        fingerprint: <Image style={{ flex: 1 }} resizeMode='contain' source={require("../../assets/icon_fingerprint.png")} />,
        face: <Image style={{ flex: 1 }} resizeMode='contain' source={require("../../assets/icon_face.png")} />,
        pattern: <Image style={{ flex: 1 }} resizeMode='contain' source={require("../../assets/icon_pattern.png")} />,
    }
    return (
        <>
            {Object.keys(props.auth).map((item, ind, arr) => {
                const item_check = Platform.OS === 'ios' ? item === 'biometrics' ? props.iosType : item : item;
                return (
                    (props.auth[item]) &&
                    <CustomOpacityButton
                        key={item}
                        disabled={props.currentAuth === item}
                        style={[styles.list_item, { borderBottomWidth: ind === arr.length - 1 ? 0 : props.auth[item] ? 0.2 : 0 }]}
                        onPress={() => {
                            setConfirmModalOpen(true);
                            modalCallback.current = async () => {
                                props.changeCurrentAuth(item);
                                await AsyncStorage.setItem(AsyncStorageCurrentAuthKey, item);
                            }
                        }}>
                        {img_src[item]}
                        <Text style={styles.list_item_text}>
                            {translate(item_check)}
                        </Text>
                        <View style={{ flex: 2 }}>
                            {item === props.currentAuth && <Icon name="checkmark-outline" size={50} color="#4F8EF7" />}
                        </View>
                    </CustomOpacityButton>
                )
            })}
            {props.count === 0 &&
                <View style={{ flex: 1, flexDirection: 'column', justifyContent: 'center' }}>
                    <Text style={{ alignSelf: 'center', fontFamily: NotoSansRegular, color: '#333333' }}>
                        {translate('haveNotAuth')}
                    </Text>
                </View>}
            <CustomConfirmModal
                title={translate('changeCurrentAuthTitle')}
                msg={
                    <Text style={styles.modalText}>
                        {translate('changeCurrentAuthContents')}
                    </Text>
                }
                modalOpen={confirmModalOpen}
                modalClose={() => {
                    setConfirmModalOpen(false);
                }}
                callback={() => {
                    if (modalCallback.current) {
                        modalCallback.current();
                    }
                }} />
        </>
    )
}

function mapStateToProps(state) {
    return {
        isLoading: state.isLoading,
        currentAuth: state.currentAuth,
        Authentications: state.Authentications
    };
}

function mapDispatchToProps(dispatch) {
    return {
        changeCurrentAuth: (auth) => {
            dispatch(ActionCreators.settingCurrentAuth(auth));
        }
    };
}

export default connect(mapStateToProps, mapDispatchToProps)(Auth_Type);