import React from 'react';
import { Modal, View, Text, Pressable, Keyboard, SafeAreaView } from "react-native";
import { RFPercentage } from 'react-native-responsive-fontsize';
import { translate } from '../../App';
import styles from '../styles/Components/CustomAlert';
import CustomOpacityButton from './CustomOpacityButton';

export function CustomNotification({modalOpen, title, msg, confirm_style, callback, noConfirm, modalClose, okText, onLayout, contentsStyle}) {
    return (
        <Modal visible={modalOpen} animationType='fade' transparent>
            <SafeAreaView style={styles.modal_container} onLayout={() => {
                if(onLayout) onLayout();
            }}>
                <View style={[styles.modal_box_container, {height: noConfirm ? '30%' : '35%'}]}>
                    <View style={styles.modal_title_container}>
                        <Text style={[styles.modal_title_text, {
                            fontSize: title && title.length > 10 ? RFPercentage(2) : RFPercentage(2.5)
                        }]}>
                            {title}
                        </Text>
                    </View>
                    <View style={[{ flex: 2, paddingVertical: '10%', paddingHorizontal: '10%' }, contentsStyle]}>
                        <View style={styles.modal_content_text_container}>
                            {msg}
                        </View>
                    </View>
                    {!noConfirm && <CustomOpacityButton
                        style={[styles.confirm_container, confirm_style]}
                        onPress={() => {
                            modalClose();
                            if (callback) {
                                callback();
                            }
                        }}>
                        <Text style={[styles.confirm_text]}>
                            {okText ? okText : translate('OK')}
                        </Text>
                    </CustomOpacityButton>}
                </View>
            </SafeAreaView>
        </Modal>
    )
}

export function CustomConfirmModal({ modalOpen, onLayout, title, msg, cancelCallback, modalClose, notCancel, callback, yesOrNo, okText, cancelText}) {
    return (
        <Modal visible={modalOpen} animationType='fade' transparent>
            <Pressable style={styles.modal_container} onLayout={() => {
                if (onLayout) onLayout();
            }} onPress={() => {
                Keyboard.dismiss();
            }}>
                <View style={[styles.modal_box_container, {height: '35%'}]}>
                    <View style={styles.modal_title_container}>
                        <Text style={styles.modal_title_text, {
                            textAlign:'center',
                            fontSize: title && title.length > 10 ? RFPercentage(2) : RFPercentage(2.5)
                        }}>
                            {title}
                        </Text>
                    </View>
                    <View style={{ flex: 2, paddingVertical: '10%', paddingHorizontal: '10%' }}>
                        <View style={styles.modal_content_text_container}>
                            {msg}
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', flex: 1.3 }}>
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