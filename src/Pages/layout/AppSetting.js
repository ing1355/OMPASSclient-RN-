import React from 'react'
import { View, Text, Image, TouchableOpacity, Platform, NativeModules } from 'react-native'
import { useDispatch, useSelector } from 'react-redux'
import { translate } from '../../../App'
import Title from '../../Components/Title'
import ToggleBtn from '../../Components/ToggleBtn'
import { settingChange } from '../../global_store/actions/settingChange'
import styles from '../../styles/layout/AppSetting'
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AsyncStorageAppSettingKey } from '../../Constans/ContstantValues'
import commonStyles from '../../styles/commonStyles'
import CustomOpacityButton from '../../Components/CustomOpacityButton'

const AppSetting = (props) => {
    const { navigation } = props
    const { appSettings } = useSelector(state => ({
        appSettings: state.appSettings
    }))
    const dispatch = useDispatch()

    return <>
        <Title
            x
            title={translate('AppSetting')}
        />
        <View style={styles.container}>
            {Platform.OS === 'android' && <View style={commonStyles.settingRowContainerStyleByPlatform}>
                <CustomOpacityButton style={commonStyles.settingRowContentStyleByPlatform} onPress={async () => {
                    const result = {
                        ...appSettings,
                        exitAfterAuth: !appSettings.exitAfterAuth
                    }
                    await AsyncStorage.setItem(AsyncStorageAppSettingKey, JSON.stringify(result), () => {
                        dispatch(settingChange(result))
                    })
                }}>
                    <View style={[commonStyles.settingRowContentSubContainerStyleByPlatform, {
                        flexDirection: 'row',
                        alignItems: 'center',
                        justifyContent: 'space-between'
                    }]}>
                        <Text style={commonStyles.settingRowContentTextStyleByPlatform}>
                            {translate('ExitAfterAuthComplete')}
                        </Text>
                        <ToggleBtn checked={appSettings.exitAfterAuth} />
                    </View>
                </CustomOpacityButton>
            </View>}
            {Platform.OS === 'android' && <View style={commonStyles.settingRowContainerStyleByPlatform}>
                <CustomOpacityButton style={commonStyles.settingRowContentStyleByPlatform} onPress={async () => {
                    NativeModules.CustomSystem.GoToSetting()
                }}>
                    <View style={[commonStyles.settingRowContentSubContainerStyleByPlatform]}>
                        <Text style={commonStyles.settingRowContentTextStyleByPlatform}>
                            {translate('NotificationSetting')}
                        </Text>
                    </View>
                </CustomOpacityButton>
            </View>}
            <View style={commonStyles.settingRowContainerStyleByPlatform}>
                <CustomOpacityButton style={[commonStyles.settingRowContentStyleByPlatform]} onPress={async () => {
                    navigation.navigate('LogsNum')
                }}>
                    <View style={[commonStyles.settingRowContentSubContainerStyleByPlatform]}>
                        <Text style={[commonStyles.settingRowContentTextStyleByPlatform]}>
                            {translate('LogsNumSetting')}
                        </Text>
                        {Platform.OS === 'android' ? <Text style={styles.setting_value_text_android}>
                            {translate('LogsNumText', { num: appSettings.logsNum })}
                        </Text> : <View style={styles.setting_value_container}>
                                <Text style={styles.setting_value_text_ios}>
                                    {translate('LogsNumText', { num: appSettings.logsNum })}
                                </Text>
                                <Image source={require('../../assets/setting_arrow.png')} style={styles.setting_arrow_img} />
                            </View>}
                    </View>
                </CustomOpacityButton>
            </View>
        </View>
    </>
}

export default AppSetting