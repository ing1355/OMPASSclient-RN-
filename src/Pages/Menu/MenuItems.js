import React, { useLayoutEffect, useState } from 'react';
import { Modal, Pressable, Text, View, KeyboardAvoidingView, Image, Platform } from 'react-native';
import { useSelector } from 'react-redux';
import { translate } from '../../../App';
import { Auth_Count } from '../../Function/Auth_Count';
import Auth_Type from '../Settings/Auth_Type';
import AsyncStorage from '@react-native-async-storage/async-storage';
import styles from '../../styles/Menu/MenuItems';
import { AsyncStorageIosTypeKey } from '../../Constans/ContstantValues';
import CustomButton from '../../Components/CustomButton';
import { AuthTypeHeight } from '../../styles/Settings/Auth_Type';

export const Menu_First_Item = ({ modalOpen, setModalOpen }) => {
  const [iosType, setIosType] = useState('fingerprint');
  const { Authentications } = useSelector((state) => ({
    Authentications: state.Authentications,
  }));
  
  const getIosType = async () => {
    setIosType(await AsyncStorage.getItem(AsyncStorageIosTypeKey));
  };

  useLayoutEffect(() => {
    getIosType();
  }, []);
  
  return (
    <Modal visible={modalOpen} animationType="fade" transparent>
      <KeyboardAvoidingView
        style={{
          flex: 1,
          flexDirection: 'column',
          justifyContent: 'flex-end',
          backgroundColor: 'rgba(51,51,51,0.3)',
        }}>
        <Pressable style={{ flex: 1, backgroundColor: 'transparent' }} onPress={() => {
          setModalOpen(false)
        }} />
        <View
          style={[
            styles.setting_modal,
            { height: 80 + (AuthTypeHeight * Auth_Count(Authentications))},
          ]}>
          <View style={styles.modal_title}>
            <Text style={styles.modal_title_text}>
              {translate('otherAuthSelect')}
            </Text>
            <CustomButton style={{width: 60, height: 60, alignItems: 'center', justifyContent: 'center'}} onPress={() => {
              setModalOpen(false)
            }}>
              <Image style={{
                width: 20,
                height: 20
              }} source={require('../../assets/black_x.png')} resizeMode='contain' />
            </CustomButton>
          </View>
          <Auth_Type
            auth={Authentications}
            count={Auth_Count(Authentications)}
            iosType={iosType}
          />
        </View>
        {
          Platform.OS === 'ios' && <View style={{height: 20, backgroundColor:'white'}}/>
        }
      </KeyboardAvoidingView>
    </Modal>
  );
};
