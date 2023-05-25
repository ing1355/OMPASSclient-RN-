import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { Platform, ScrollView, View, Text, Image } from 'react-native';
import { translate } from '../../../../App';
import Title from '../../../Components/Title';
import styles from '../../../styles/Menu/Logs/Logs';
import LogItem from './LogItem';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AsyncStorageLogKey } from '../../../Constans/ContstantValues';

const profile1 = {
    username: 'hozzi@omsecurity.kr',
    OS: 'Mac 10.15',
    Browser: 'Safari Mobile',
    GPU: 'Apple GPU',
    logs: [
        {
            createdAt: '2022-12-07 11:47:30',
            result: true,
            type: 'auth'
        },
        {
            createdAt: '2022-12-07 11:47:30',
            result: false,
            type: 'auth'
        },
        {
            createdAt: '2022-12-07 11:47:30',
            result: true,
            type: 'reg'
        },
        {
            createdAt: '2022-12-07 11:47:30',
            result: false,
            type: 'reg'
        },
        {
            createdAt: '2022-12-07 11:47:30',
            result: true,
            type: 'reg'
        },
    ]
}
const profile2 = {
    username: 'hozzi2@omsecurity.kr',
    OS: 'Mac 10.15',
    Browser: 'Safari Mobile',
    GPU: 'Apple GPU',
    logs: []
}

const mockData = [
    {
        domain: 'https://naver.com',
        datas: [
            profile1,
            profile2
        ]
    },
    {
        domain: 'https://ompass.kr:4002',
        datas: [
            profile1,
            profile2
        ]
    }
]

const Logs = (props) => {
    const [list_data, setList_data] = useState([]);

    useLayoutEffect(() => {
        const getLogDatas = async () => {
            const data = JSON.parse(await AsyncStorage.getItem(AsyncStorageLogKey))
            setList_data([...data])
        }
        getLogDatas()
    }, [])

    return (
        <>
            <Title
                title={translate('RegistrationInformation')}
                x
            />
            <View style={{ flex: 1, paddingHorizontal: '5%', backgroundColor: 'white', paddingVertical: 15 }}>
                {list_data.length > 0 ?
                    <ScrollView style={styles.container}>
                        {
                            list_data.map(data =>
                                <LogItem data={data} key={data.domain} />
                            )
                        }
                    </ScrollView> : <>
                        <View style={[styles.container, {
                            justifyContent: 'center',
                            alignItems: 'center'
                        }]}>
                            <Image source={require('../../../assets/emptyLogIcon.png')} style={{
                                width: 80,
                                height: 80,
                                marginBottom: 30
                            }} />
                            <Text style={styles.empty_text}>
                                {translate('EmptyLogText')}
                            </Text>
                        </View>
                        <View style={{ flex: 0.5, backgroundColor: 'white' }} />
                    </>}
            </View>
            <View style={{
                height: Platform.OS === 'android' ? 0 : 20,
                backgroundColor: 'white'
            }} />
        </>
    )
}

export default Logs;