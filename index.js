import 'react-native-reanimated'
import { AppRegistry } from 'react-native';
import App from './App';
import React from 'react'
import { name as appName } from './app.json';
import { Provider } from 'react-redux';
import store from './src/global_store/store';

const HeadlessCheck = ({data, isHeadless}) => {
  if (isHeadless) {
    return null;
  }

  return <Provider store={store}>
    <App data={data}/>
  </Provider>;
};

AppRegistry.registerComponent(appName, () => HeadlessCheck);