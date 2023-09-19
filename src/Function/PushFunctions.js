import { Auth_Count } from "./Auth_Count";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AsyncStorageAuthenticationsKey } from "../Constans/ContstantValues";
import { isJson, saveDataToLogFile } from "./GlobalFunction";

export async function push_function(data, callback) {
  if (!isJson(data)) {
    saveDataToLogFile("Push Function Fail(Not Json)", data)
    return;
  }
  const count = Auth_Count(JSON.parse(await AsyncStorage.getItem(AsyncStorageAuthenticationsKey)));
  if (count > 0 && callback) callback(data);
  else saveDataToLogFile("Push Function Fail(Auth Count is 0)", data)
}
