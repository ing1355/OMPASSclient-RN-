import React, { useEffect, useState } from 'react'
import { StatusBar, Platform, SafeAreaView } from 'react-native'

export const iosStatusBarHeight = 45

const getColorByRouteName = (name) => {
    switch (name) {
        case "HOME":
            return "rgb(57,174,253)"
        case "QrCode":
            return "rgba(0,0,0,.5)"
        case "Auth_Fail":
        case "Auth_Complete":
            return "#F2F2F2"
        default:
            return "white"
    }
}

const CustomStatusBar = ({ navigationRef }) => {
    const [backgroundColorState, setBackgroundColorState] = useState(getColorByRouteName("HOME"))
    const [barStyleState, setBarStyleState] = useState("light-content")
    useEffect(() => {
        navigationRef.current.addListener('state', e => {
            const routeName = navigationRef.current.getRootState().routes.slice(-1,)[0].name
            setBackgroundColorState(routeName)
            if(routeName === 'HOME') setBarStyleState('light-content')
            else setBarStyleState('dark-content')
        })
    }, [])
    return Platform.OS === 'ios' 
    ? backgroundColorState !== 'QrCode' && <SafeAreaView style={{backgroundColor:getColorByRouteName(backgroundColorState), height: iosStatusBarHeight}}/>
    : <StatusBar backgroundColor={getColorByRouteName(backgroundColorState)} barStyle={barStyleState}/>
}

export default CustomStatusBar