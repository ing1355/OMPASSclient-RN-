import React from 'react'
import styles from '../../../styles/Menu/Logs/LogProfile'
import { View, Text, ScrollView, Image } from 'react-native';
import { translate } from '../../../../App';

const createTextRow = (title, description, style, option) => <View style={[styles.log_detail_profile_row_container, {
    ...style
}]}>
    <Text style={styles.log_detail_profile_row_title}>
        {title}
    </Text>
    <Text style={[styles.log_detail_profile_row_description]} numberOfLines={1} ellipsizeMode="tail" {...option}>
        {description}
    </Text>
</View>

const LogProfile = ({ data }) => {
    const { username, OS, Browser, GPU, logs } = data
    return <View style={styles.log_detail_profile_container}>
        {createTextRow('ID', username)}
        {createTextRow('OS', OS)}
        {createTextRow('Browser', Browser)}
        {createTextRow('GPU', GPU, {
            height: 45
        }, {
            numberOfLines: 2,
            ellipsizeMode: "tail"
        })}
        <ScrollView
            style={styles.log_detail_logs_scroll_container}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{
                flex: logs.length > 2 ? 0 : 1,
                justifyContent: logs.length > 2 ? 'flex-start' : 'center',
                alignItems: 'center',
            }}>
            {
                logs.map((log, ind) => <View key={ind} style={[styles.log_detail_logs_item_container, {
                    marginRight: 10
                }]}>
                    <Text style={styles.log_detail_logs_text}>
                        {log.createdAt.split(' ')[0]}
                    </Text>
                    <Text style={styles.log_detail_logs_text}>
                        {log.createdAt.split(' ')[1]}
                    </Text>
                    <View style={styles.log_detail_logs_authenticate_result_text_container}>
                        <Text style={[styles.log_detail_logs_text, styles.log_detail_logs_authenticate_result_text, {
                            color: log.result ? "#2685d3" : "#d84545"
                        }]}>
                            {
                                log.type === 'reg' ? (translate(log.result ? "registration_success" : "registration_fail"))
                                    : translate(log.result ? "authentication_success" : "authentication_fail")
                            }
                        </Text>
                    </View>
                    {log.result && <Image source={require('../../../assets/log_detail_success.png')} resizeMode="contain" style={styles.log_detail_logs_authenticate_icon} />}
                    {!log.result && <Image source={require('../../../assets/log_detail_fail.png')} resizeMode="contain" style={styles.log_detail_logs_authenticate_icon} />}
                </View>)
            }
        </ScrollView>
    </View>
}

export default LogProfile;