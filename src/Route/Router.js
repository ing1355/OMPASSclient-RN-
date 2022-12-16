import * as React from 'react';
import { StackActions } from '@react-navigation/native';

export const navigationRef = React.createRef();

export function navigate(name, params) {
  navigationRef.current && navigationRef.current.navigate(name, params);
}

export function goBack() {
  navigationRef.current && navigationRef.current.goBack();
}

export function reset(params) {
    navigationRef.current && navigationRef.current.reset({ index: 0, routes: [{ name: 'HOME' }], params: params });
}

export function replace(name, params) {
  navigationRef.current && navigationRef.current.dispatch(
    StackActions.replace(name, params)
  );
}

export function getRouteName() {
  return navigationRef.current && navigationRef.current.getCurrentRoute().name.toLowerCase();
}