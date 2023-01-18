import React, { useEffect, useMemo, useState } from 'react';
import {
  Text,
  View,
  Pressable,
  Image,
  TouchableHighlight,
  AppState,
} from 'react-native';
import { RFPercentage } from 'react-native-responsive-fontsize';
import { connect } from 'react-redux';
import { Circle } from '../../Components';
import {
  CustomConfirmModal,
  CustomNotification,
} from '../../Components/CustomAlert';
import Title from '../../Components/Title';
import ActionCreators from '../../global_store/actions';
import styles from '../../styles/layout/Pin';
import {
  AuthSecurity,
  AuthenticateGetErrorCount,
  AuthenticateIsLock,
  AuthenticateErrorCountAdd,
  AuthenticateLock,
  AuthenticateResetErrorCount,
} from '../../Auth/Security';
import { NotoSansRegular } from '../../env';
import { translate } from '../../../App';
import { getOtherAuthentication } from '../../Function/GetOtherAuthentication';

let id = 0;
const circleSize = 20

const Pin = (props) => {
  const [error, setError] = useState(false);
  const [lengthError, setLengthError] = useState(true);
  const [errorCount, setErrorCount] = useState(0);
  const [errorTimeStamp, setErrorTimeStamp] = useState(0);
  const [modalOpen2, setModalOpen2] = useState(false);
  const [value, setValue] = useState('');
  const [confirm_value, setConfirm_value] = useState('');
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [isConfirm, setIsConfirm] = useState(false);
  const [count, setCount] = useState(-1);
  const [regist_error, setRegist_error] = useState(false);

  const ErrorCheckFunc = () => {
    if (count > 1) {
      setModalOpen2(true)
      return true
    } else return false
  }

  const ErrorCountCheckFunction = async () => {
    await AuthenticateGetErrorCount(async (count) => {
      setErrorCount(count);
    });
    await AuthenticateIsLock(async (timestamp) => {
      setErrorTimeStamp(timestamp);
    });
  }

  useEffect(() => {
    let AppStateListener
    const unsubscribe = props.navigation.addListener('focus', () => {
      if (props.route.params.text !== 'first_regist') {
        ErrorCountCheckFunction()
        AppStateListener = AppState.addEventListener('change', (nextAppState) => {
          if (nextAppState === 'active') {
            ErrorCountCheckFunction()
          } else {
            setErrorCount(0)
            setErrorTimeStamp(0)
            clearInterval(id);
          }
        })
      } else {
        setErrorCount(0);
        setErrorTimeStamp(0);
      }
      Error_init();
      props.loadingToggle(false);
    });
    const blursubscribe = props.navigation.addListener('blur', () => {
      if(props.route.params && props.route.params.cancelCallback) props.route.params.cancelCallback()
      if (AppStateListener) AppStateListener.remove()
      setCount(-1);
      clearInterval(id);
    });
    return () => {
      setIsConfirm(false);
      unsubscribe();
      blursubscribe();
    };
  }, [props.navigation]);

  useEffect(() => {
    if (errorTimeStamp !== 0 && props.route.params.text !== 'first_regist') {
      const dif_timestamp =
        parseInt(errorTimeStamp) - Math.floor(Date.now() / 1000);
      if (dif_timestamp > 0) {
        if (errorCount > 4) {
          setModalOpen2(true);
          setCount(dif_timestamp);
          clearInterval(id);
          id = setInterval(() => {
            setCount((count) => count - 1);
          }, 1000);
        }
      }
    } else {
    }
  }, [errorTimeStamp]);
  
  function input_value(num_str) {
    if (isConfirm) {
      if (confirm_value.length < 6) {
        setConfirm_value(confirm_value + num_str);
      }
    } else {
      if (value.length < 6) {
        setValue(value + num_str);
      }
    }
  }

  function draw_keypad_number(num_str) {
    return (
      <TouchableHighlight
        style={[styles.keypad_col]}
        onPress={() => {
          if (ErrorCheckFunc()) return;
          Error_init();
          input_value(num_str);
        }}
        activeOpacity={1}
        underlayColor={count > 0 ? "white" : "#DDDDDD"}
      >
        <Text style={styles.keypad_text}>{num_str}</Text>
      </TouchableHighlight>
    );
  }

  function draw_keypad_number_row(num) {
    return (
      <View style={styles.keypad_row}>
        {draw_keypad_number(`${num * 3 + 1}`)}
        {draw_keypad_number(`${num * 3 + 2}`)}
        {draw_keypad_number(`${num * 3 + 3}`)}
      </View>
    );
  }

  const getCircleColor = (num) => {
    return isConfirm
      ? confirm_value.length > num
        ? '#0e71b8'
        : '#dddddd'
      : value.length > num
        ? '#0e71b8'
        : '#dddddd'
  }

  function draw_circle() {
    return (
      <>
        <Circle
          size={circleSize}
          color={getCircleColor(0)}
        />
        <Circle
          size={circleSize}
          color={getCircleColor(1)}
        />
        <Circle
          size={circleSize}
          color={getCircleColor(2)}
        />
        <Circle
          size={circleSize}
          color={getCircleColor(3)}
        />
        <Circle
          size={circleSize}
          color={getCircleColor(4)}
        />
        <Circle
          size={circleSize}
          color={getCircleColor(5)}
        />
      </>
    );
  }

  function Error_Length() {
    if (isConfirm) {
      setRegist_error(false);
      setLengthError(true);
      setConfirm_value('');
    } else {
      setLengthError(true);
      setValue('');
    }
  }

  function Error_init() {
    setRegist_error(false);
    setError(false);
    setLengthError(false);
  }

  function Error_Verify() {
    if (isConfirm) {
      if (props.route.params.text === 'first_regist') setRegist_error(true);
      else setError(true);
      setConfirm_value('');
    } else {
      AuthenticateErrorCountAdd(async (errorCount) => {
        setErrorCount(errorCount);
        if (errorCount > 4) {
          setError(false);
          AuthenticateLock(errorCount);
          await AuthenticateIsLock(async (timestamp) => {
            setErrorTimeStamp(timestamp);
            setValue('');
          });
        }
        setError(true);
        setValue('');
      });
    }
    props.loadingToggle(false);
  }

  useEffect(() => {
    if (
      (isConfirm && confirm_value.length === 6) ||
      (!isConfirm && value.length === 6)
    ) {
      setError(false);
      setRegist_error(false);
      setLengthError(false);
      const { loadingToggle } = props;
      if (props.route.params.text === 'first_regist') {
        if (isConfirm) {
          if (confirm_value.length === 6) {
            if (value === confirm_value) {
              setTimeout(() => {
                AuthSecurity(value, 'pin', '등록', (suc) => {
                  if (props.route.params) {
                    loadingToggle(false);
                    setNotifyOpen(true);
                  }
                });
              }, 100);
            } else {
              Error_Verify();
            }
          } else {
            Error_Length();
          }
        } else {
          if (value.length === 6) {
            setIsConfirm(true);
          } else {
            Error_Length();
          }
        }
      } else if (props.route.params.text === 'local_Authenticate') {
        if (value.length === 6) {
          AuthSecurity(
            value,
            'pin',
            '인증',
            (suc) => {
              console.log(suc);
              if (suc === 'success') {
                AuthenticateResetErrorCount();
                setValue('');
                setConfirm_value('');
                props.route.params.callback();
              } else {
                Error_Verify();
              }
            },
            (err) => {
              console.log(err);
              Error_Verify();
            },
          );
        } else {
          Error_Length();
        }
      } else {
        if (value.length === 6) {
          AuthSecurity(
            value,
            'pin',
            '인증',
            (suc) => {
              if (suc === 'success') {
                AuthenticateResetErrorCount();
                setValue('');
                setConfirm_value('');
                props.navigation.replace('Auth_Ing', {
                  text: props.route.params.text,
                  callback: props.route.params.callback,
                });
              } else {
                Error_Verify();
              }
            },
            () => {
              Error_Verify();
            },
          );
        } else {
          Error_Length();
        }
      }
    }
  }, [isConfirm, value, confirm_value]);

  return (
    <>
      <Title
        x
        title={translate('pin')}
        backRoute={props.route.params.text === 'first_regist' ? 'Setting' : 'HOME'}
      />
      <View style={styles.container}>
        <View style={styles.guide_text_container}>
          {
            <Text style={[styles.guide_text]}>
              {!isConfirm
                ? translate('pinGuideText') + ' ' + translate('pinRequired_msg')
                : translate('pinAgain_msg')}
            </Text>
          }
        </View>
        <View style={styles.input_container}>
          <View style={styles.error_container}>
            <View style={{ flexDirection: 'row' }}>
              <View style={{ justifyContent: 'flex-start' }}>
                {(error || lengthError || count > 0 || regist_error) && (
                  <Image
                    source={require('../../assets/info_red.png')}
                    resizeMode="contain"
                    style={{ width: 20, height: 20, top: 3, right: 5 }}
                  />
                )}
              </View>
              <View style={{ justifyContent: 'flex-start' }}>
                {regist_error && (
                  <Text style={styles.guide_error_text}>
                    {translate('pinNotMatch')}
                  </Text>
                )}
                {error && (
                  <Text style={styles.guide_error_text}>
                    {translate('pinNotMatch') + '(' + errorCount + '/5)'}
                  </Text>
                )}
                {lengthError && (
                  <Text style={styles.guide_error_text}>
                    {translate('pinShort')}
                  </Text>
                )}
                {errorCount > 4 && count > 0 && (
                  <Text style={styles.guide_error_text}>
                    {translate('pinLock')} ({count}
                    {translate('Lock_time')})
                  </Text>
                )}
              </View>
            </View>
          </View>
          <View style={{ flex: 0.5 }} />
        </View>
        <Pressable
          style={styles.pin_container}
          disabled={count > 0 && props.route.params.text !== 'first_regist'}
          onPress={() => {
            setLengthError(false);
            setError(false);
            setRegist_error(false);
          }}>
          {draw_circle()}
        </Pressable>
        <View style={styles.pin_input_layout}>
          {draw_keypad_number_row(0)}
          {draw_keypad_number_row(1)}
          {draw_keypad_number_row(2)}
          <View style={styles.keypad_row}>
            <Pressable style={{ flex: 1 }} onPress={() => {
              if (ErrorCheckFunc()) return;
            }} />
            {draw_keypad_number('0')}
            <TouchableHighlight
              activeOpacity={1}
              underlayColor={count > 0 ? "white" : "#DDDDDD"}
              style={[styles.keypad_col]}
              onPress={() => {
                if (ErrorCheckFunc()) return;
                if (isConfirm) {
                  if (confirm_value.length) {
                    setConfirm_value(confirm_value.slice(0, -1));
                  }
                } else {
                  if (value.length) {
                    setValue(value.slice(0, -1));
                  }
                }
              }}>
              <Image
                source={require('../../assets/del.png')}
                resizeMode="contain"
                style={{ alignSelf: 'center', width: '20%' }}
              />
            </TouchableHighlight>
          </View>
        </View>
      </View>
      <CustomNotification
        modalOpen={notifyOpen}
        modalClose={() => {
          setNotifyOpen(false);
        }}
        title={
          props.route.params.text === 'first_regist'
            ? translate('pinRegist')
            : null
        }
        msg={
          <Text
            style={{
              fontSize: RFPercentage(2),
              fontFamily: NotoSansRegular,
              textAlign: 'center',
            }}>
            {props.route.params.text === 'first_regist'
              ? translate('pinRegistSuccess')
              : null}
          </Text>
        }
        callback={() => {
          props.route.params.callback();
          props.loadingToggle(false);
        }}
      />
      <CustomConfirmModal
        title={translate('isLock')}
        msg={
          <Text style={{ textAlign: 'center' }}>
            {translate('changeToOtherAuth')}
          </Text>
        }
        modalOpen={modalOpen2}
        modalClose={() => {
          setModalOpen2(false);
        }}
        callback={async () => {
          if(!getOtherAuthentication({
            ...props,
            ...props.route.params,
            type: 'pin',
          })) props.navigation.replace('HOME')
        }}
      />
    </>
  );
};

function mapStateToProps(state) {
  return {
    isLoading: state.isLoading,
    Authentications: state.Authentications,
  };
}

function mapDispatchToProps(dispatch) {
  return {
    loadingToggle: (toggle) => {
      dispatch(ActionCreators.loadingToggle(toggle));
    },
    changeNotificationToggle: (auth) => {
      dispatch(ActionCreators.changeNotificationToggle(auth));
    },
  };
}

export default connect(mapStateToProps, mapDispatchToProps)(Pin);
