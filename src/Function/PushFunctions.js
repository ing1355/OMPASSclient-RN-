import { Auth_Count } from "./Auth_Count";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AsyncStorageAuthenticationsKey } from "../Constans/ContstantValues";

function isJson(str) {
  try {
    if (!JSON.parse(str)) return false;
  } catch (e) {
    return false;
  }
  return true;
}

export async function push_function(data, callback) {
  if (!isJson(data)) return;
  const count = Auth_Count(JSON.parse(await AsyncStorage.getItem(AsyncStorageAuthenticationsKey)));
  if (count > 0 && callback) callback(data);
}
