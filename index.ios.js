/**
 * @format
 */

import 'react-native-reanimated'
import { AppRegistry } from 'react-native';
import App from './App';
import React from 'react'
import { name as appName } from './app.json';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Provider } from 'react-redux';
import store from './src/global_store/store';
import { AsyncStoragePushDataKey } from './src/Constans/ContstantValues';
import { displayNotification } from './src/Function/displayNotification';
import messaging from '@react-native-firebase/messaging'
import notifee from '@notifee/react-native'

messaging().setBackgroundMessageHandler(async (message) => {
  if (message) {
    displayNotification(message);
  }
});

notifee.onBackgroundEvent(async ({ type, detail }) => {
  const { notification, pressAction } = detail;
  await AsyncStorage.setItem(AsyncStoragePushDataKey, notification.data.data)
});

const HeadlessCheck = ({ isHeadless }) => {
  if (isHeadless) {
    return null;
  }

  return <Provider store={store}>
    <App />
  </Provider>;
};

AppRegistry.registerComponent(appName, () => HeadlessCheck);
