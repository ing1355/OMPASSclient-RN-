import React from 'react';
import { Modal, View, Text, Pressable, Keyboard, SafeAreaView } from "react-native";
import { RFPercentage } from 'react-native-responsive-fontsize';
import { translate } from '../../App';
import styles from '../styles/Components/CustomAlert';
import CustomOpacityButton from './CustomOpacityButton';

export function CustomNotification({modalOpen, title, msg, confirm_style, callback, noConfirm, modalClose, okText, onLayout, contentsStyle}) {
    return (
        <Modal visible={modalOpen} animationType='fade' transparent presentationStyle="overFullScreen">
            <SafeAreaView style={styles.modal_container} onLayout={() => {
                if(onLayout) onLayout();
            }}>
                <View style={[styles.modal_box_container]}>
                    <View style={styles.modal_title_container}>
                        <Text style={[styles.modal_title_text, {
                            fontSize: title && title.length > 10 ? RFPercentage(2) : RFPercentage(2.5)
                        }]}>
                            {title}
                        </Text>
                    </View>
                    <View style={[{ paddingVertical: '4%', paddingHorizontal: '8%' }, contentsStyle]}>
                        <View style={styles.modal_content_text_container}>
                            {msg}
                        </View>
                    </View>
                    {!noConfirm && <View style={{
                        height: 50
                    }}>
                        <CustomOpacityButton
                        style={[styles.confirm_container, confirm_style]}
                        onPress={() => {
                            if(modalClose) modalClose();
                            if (callback) {
                                callback();
                            }
                        }}>
                        <Text style={[styles.confirm_text]}>
                            {okText ? okText : translate('OK')}
                        </Text>
                    </CustomOpacityButton>
                    </View>}
                </View>
            </SafeAreaView>
        </Modal>
    )
}

export function CustomConfirmModal({ modalOpen, onLayout, title, msg, cancelCallback, modalClose, notCancel, callback, yesOrNo, okText, cancelText, onShow, boxStyle}) {
    return (
        <Modal visible={modalOpen} animationType='fade' transparent onShow={onShow}>
            <Pressable style={styles.modal_container} onLayout={() => {
                if (onLayout) onLayout();
            }} onPress={() => {
                Keyboard.dismiss();
            }}>
                {/* <View style={[styles.modal_box_container, {minHeight: '40%', ...boxStyle}]}> */}
                <View style={[styles.modal_box_container]}>
                    <View style={styles.modal_title_container}>
                        <Text style={[styles.modal_title_text, {
                            textAlign:'center',
                            fontSize: title && title.length > 10 ? RFPercentage(2) : RFPercentage(2.5)
                        }]}>
                            {title}
                        </Text>
                    </View>
                    <View style={{ paddingVertical: '4%', paddingHorizontal: '8%' }}>
                        <View style={styles.modal_content_text_container}>
                            {msg}
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', height: 50 }}>
                        <CustomOpacityButton style={styles.cancel_container} onPress={() => {
                            if (cancelCallback) cancelCallback();
                            if (modalClose) modalClose();
                        }}>
                            <Text style={styles.cancel_text}>
                                {cancelText ? cancelText : (yesOrNo ? translate('no') : translate('Revoke'))}
                            </Text>
                        </CustomOpacityButton>
                        <CustomOpacityButton
                            style={styles.confirm_container}
                            onPress={() => {
                                if (!notCancel) modalClose();
                                if (callback) {
                                    callback();
                                }
                            }}>
                            <Text style={styles.confirm_text}>
                                {okText ? okText : (yesOrNo ? translate('yes') : translate('OK'))}
                            </Text>
                        </CustomOpacityButton>
                    </View>
                </View>
            </Pressable>
        </Modal>
    )
}