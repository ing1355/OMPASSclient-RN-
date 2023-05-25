import BioMetric from './BioMetric';
import Pin from './Pin';
import Pattern from './Pattern';
import Face from './Face';
import Fingerprint from './Fingerprint';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as RootNavigation from '../Route/Router';
import { AsyncStorageCurrentAuthKey } from '../Constans/ContstantValues';

export default function LocalAuthenticate(type, AuthenticateCallback) {
  switch (type) {
    case 'biometrics':
      return BioMetric({AuthenticateCallback});
    case 'pattern':
      return Pattern({AuthenticateCallback});
    case 'pin':
      return Pin({AuthenticateCallback});
    case 'face':
      return Face({AuthenticateCallback});
    case 'fingerprint':
      return Fingerprint({AuthenticateCallback});
    default:
      return false;
  }
}

export async function local_auth(isOtp) {
  const params = () => {
    RootNavigation.replace(isOtp ? 'OTP' : 'Setting');
  };
  LocalAuthenticate(await AsyncStorage.getItem(AsyncStorageCurrentAuthKey), params);
}