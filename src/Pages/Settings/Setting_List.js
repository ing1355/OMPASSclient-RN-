import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useEffect, useState } from 'react';
import { View, Text, Platform, Pressable, TouchableOpacity } from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { connect } from 'react-redux';
import { translate } from '../../../App';
import SelectAuthentication from '../../Auth/SelectAuthentication';
import { CustomConfirmModal } from '../../Components/CustomAlert';
import ActionCreators from '../../global_store/actions';
import styles from '../../styles/Settings/Setting_List';
import { RemoveSecurity } from '../../Auth/Security';
import { NotoSansRegular } from '../../env';
import ToggleBtn from '../../Components/ToggleBtn';
import { AsyncStorageAuthenticationsKey, AsyncStorageCurrentAuthKey } from '../../Constans/ContstantValues';
import CustomOpacityButton from '../../Components/CustomOpacityButton';

let AuthenticationTemp = {}

let toggleClicked = false

const Setting_List = (props) => {
  const [item_name, setItem_name] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const {
    Authentications,
    iosType,
    loadingToggle,
    currentAuth,
    changeCurrentAuth,
    auth,
    list,
    navigation
  } = props;
  const [checkedItems, setCheckedItems] = useState([]);

  useEffect(() => {
    if (Authentications) {
      AuthenticationTemp = Authentications
      setCheckedItems(Authentications)
    }
  }, [Authentications])

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      setCheckedItems(AuthenticationTemp)
      toggleClicked = false
    });

    return () => {
      unsubscribe();
    };
  }, [navigation]);

  return (
    <>
      {list.map((item, ind, arr) => {
        return (
          <CustomOpacityButton
            key={item}
            style={[styles.list_item_container]}
            onPress={async () => {
              if (!toggleClicked) {
                toggleClicked = true
                if (Authentications[item]) {
                  setItem_name(item);
                  setModalOpen(true);
                  toggleClicked = false
                  return;
                }
                const callback = async () => {
                  let obj = {};
                  obj[item] = !Authentications[item];
                  await auth(obj);
                  let temp = { ...Authentications };
                  temp[item] = !temp[item];
                  await AsyncStorage.setItem(
                    AsyncStorageAuthenticationsKey,
                    JSON.stringify(temp),
                  );
                  if (!currentAuth.length) {
                    await changeCurrentAuth(item);
                    await AsyncStorage.setItem(AsyncStorageCurrentAuthKey, item);
                  }
                };
                if (!Authentications[item]) {
                  const temp = { ...Authentications }
                  temp[item] = true
                  setCheckedItems(temp)
                }
                setTimeout(() => {
                  SelectAuthentication(item, callback);
                }, 350);
                loadingToggle(false);
              }
            }}>
            <View style={[styles.list_item, {
              borderBottomWidth: ind === arr.length - 1 ? 0 : 0.2
            }]}>
              <Text style={styles.list_item_text}>
                {translate(
                  Platform.OS === 'ios'
                    ? item === 'biometrics'
                      ? iosType
                      : item
                    : item,
                )}
              </Text>
              <ToggleBtn checked={checkedItems[item]} />
            </View>
          </CustomOpacityButton>
        );
      })}
      <CustomConfirmModal
        modalOpen={modalOpen}
        modalClose={() => {
          setModalOpen(false);
        }}
        title={translate('authRemove')}
        msg={
          <Text
            onTextLayout={() => {
              loadingToggle(false);
            }}
            style={{
              fontSize: RFPercentage(2),
              fontFamily: NotoSansRegular,
              textAlign: 'center',
            }}>
            {translate(item_name + 'Remove')}
          </Text>
        }
        callback={async () => {
          RemoveSecurity(item_name, async () => {
            let obj = {};
            obj[item_name] = !Authentications[item_name];
            await auth(obj);
            let temp = { ...Authentications };
            temp[item_name] = !temp[item_name];
            await AsyncStorage.setItem(AsyncStorageAuthenticationsKey, JSON.stringify(temp));
            if (currentAuth === item_name) {
              let next_auth = '';
              Object.keys(temp).map((key) => {
                if (temp[key] && next_auth === '') {
                  next_auth = key;
                }
              });
              await changeCurrentAuth(next_auth.length ? next_auth : '');
              await AsyncStorage.setItem(
                AsyncStorageCurrentAuthKey,
                next_auth.length ? next_auth : '',
              );
            }
            setTimeout(() => {
              loadingToggle(false);
            }, 100);
          });
          // }
        }}
      />
    </>
  );
};

function mapStateToProps(state) {
  return {
    isLoading: state.isLoading,
    Authentications: state.Authentications,
    currentAuth: state.currentAuth,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    loadingToggle: (toggle) => {
      dispatch(ActionCreators.loadingToggle(toggle));
    },
    auth: async (info) => {
      dispatch(ActionCreators.settingAuthentications(info));
    },
    changeCurrentAuth: async (auth) => {
      dispatch(ActionCreators.settingCurrentAuth(auth));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Setting_List);
