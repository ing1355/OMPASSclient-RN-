import 'react-native-reanimated'
import { AppRegistry, Platform } from 'react-native';
import App from './App';
import React from 'react'
import { name as appName } from './app.json';
import { Provider } from 'react-redux';
import store from './src/global_store/store';
import { saveDataToLogFile } from './src/Function/GlobalFunction';
import { CustomNativeEventEmitter } from './src/Function/NativeModules';
import CodePush from 'react-native-code-push';

export let silencePush = null;

export const silencePushClear = () => {
  silencePush = null
}

if(Platform.OS === 'ios') {
  global.ErrorUtils.setGlobalHandler((error, isFatal) => {
    saveDataToLogFile('ErrorUtils GlobalHandelr', error)
    if(error.stack) {
      const stackLines = error.stack.split('\n')
      saveDataToLogFile('ErrorUtils GlobalHandelr(Detail)', stackLines)
    }
  })
}

saveDataToLogFile("Register Received PushEvent in Index Event Listener")
CustomNativeEventEmitter.addListener('pushEvent', data => {
  saveDataToLogFile("Received PushEvent in Index", Platform.OS === 'android' ? data : data.data)
  silencePush = Platform.OS === 'android' ? data : data.data
})

// CustomNativeEventEmitter.addListener("pushOpenedApp", (data) => {
//   saveDataToLogFile("Android Opened Push2 in Index", data)
//   silencePush = data
// })

const codePushOptions = {
  checkFrequency: CodePush.CheckFrequency.ON_APP_START,
  installMode: CodePush.InstallMode.IMMEDIATE,
  mandatoryInstallMode: CodePush.InstallMode.IMMEDIATE,
  updateDialog: {
    title: "새로운 업데이트가 존재합니다.",
    optionalUpdateMessage: "지금 업데이트하시겠습니까?",
    optionalIgnoreButtonLabel: "나중에",
    optionalInstallButtonLabel: "업데이트"
  }
};

// CodePush.getUpdateMetadata().then(res => {
//   console.log(res)
// })

// const codePushOptions = {
//   checkFrequency: CodePush.CheckFrequency.언제체크할지설정,
//   installMode: CodePush.InstallMode.설치모드설정,
//   mandatoryInstallMode: CodePush.InstallMode.설치모드설정,
// };

// CodePush.sync({}, (status, b, c) => {
//   console.log('status : ',status, Object.keys(CodePush.SyncStatus)[status], b, c)
// }, (progress) => {
//   console.log('progress : ',progress)
// }).catch(err => {
//   console.log(err)
// })

const HeadlessCheck = CodePush(codePushOptions)(({data, isHeadless}) => {
  if (isHeadless) {
    saveDataToLogFile("isHeadless")
    return null;
  }

  return <Provider store={store}>
    <App data={data}/>
  </Provider>;
});

AppRegistry.registerComponent(appName, () => HeadlessCheck);