import React from 'react'
import { View, TouchableOpacity, Text, Image } from 'react-native'
import Title from '../../Components/Title'
import commonStyles from '../../styles/commonStyles'
import styles from '../../styles/layout/LogsNum'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useDispatch, useSelector } from 'react-redux'
import { AsyncStorageAppSettingKey, AsyncStorageLogKey } from '../../Constans/ContstantValues'
import { settingChange } from '../../global_store/actions/settingChange'
import { translate } from '../../../App'
import CustomOpacityButton from '../../Components/CustomOpacityButton'

const items = [10, 20, 30, 40, 50]

const LogsNum = () => {
    const { appSettings } = useSelector(state => ({
        appSettings: state.appSettings
    }))

    const dispatch = useDispatch()
    return <>
        <Title back title={translate("LogsNumSetting")} />
        <View style={[commonStyles.settingRowContainerStyleByPlatform]}>
            <View style={[commonStyles.settingRowContentStyleByPlatform, {
                height: (Platform.OS === 'android' ? 60 : 45) * items.length,
            }]}>
                {
                    items.map((_, ind, arr) => <CustomOpacityButton
                        style={[commonStyles.settingRowContentSubContainerStyleByPlatform, {
                            paddingHorizontal: 0,
                            justifyContent: 'center',
                        }]}
                        key={ind}
                        disabled={appSettings.logsNum === _}
                        onPress={async () => {
                            const result = {
                                ...appSettings,
                                logsNum: _
                            }
                            await AsyncStorage.setItem(AsyncStorageAppSettingKey, JSON.stringify(result), () => {
                                dispatch(settingChange(result))
                            })
                            const data = JSON.parse(await AsyncStorage.getItem(AsyncStorageLogKey))
                            await AsyncStorage.setItem(AsyncStorageLogKey, JSON.stringify(data.map(d => ({
                                ...d,
                                datas: d.datas.map(_d => ({
                                    ..._d,
                                    logs: _d.logs.slice(0, _)
                                }))
                            }))))
                        }}>
                        <View style={[styles.row_container, {
                            borderTopWidth: ind % 2 === 1 ? 1 : 0,
                            borderBottomWidth: ind % 2 === 1 ? 1 : 0,
                        }]}>
                            <Text style={commonStyles.settingRowContentTextStyleByPlatform}>
                                {translate('LogsNumText', { num: _ })}
                            </Text>
                            {appSettings.logsNum === _ && <Image style={styles.check_icon} source={require('../../assets/icon_complete.png')} resizeMode="contain" />}
                        </View>
                    </CustomOpacityButton>)
                }
            </View>
        </View>
    </>
}

export default LogsNum