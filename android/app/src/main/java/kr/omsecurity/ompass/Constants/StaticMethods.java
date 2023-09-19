package kr.omsecurity.ompass.Constants;

import android.content.Context;
import android.util.Log;
import com.facebook.react.ReactInstanceEventListener;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.bridge.*;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import kr.omsecurity.ompass.CustomSystem;
import kr.omsecurity.ompass.MainApplication;
import org.json.JSONArray;
import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.math.BigInteger;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Iterator;

public class StaticMethods {
    public static WritableMap convertJsonToMap(JSONObject jsonObject) throws JSONException {
        WritableMap map = new WritableNativeMap();

        Iterator<String> iterator = jsonObject.keys();
        while (iterator.hasNext()) {
            String key = iterator.next();
            Object value = jsonObject.get(key);
            if (value instanceof JSONObject) {
                map.putMap(key, convertJsonToMap((JSONObject) value));
            } else if (value instanceof JSONArray) {
                map.putArray(key, convertJsonToArray((JSONArray) value));
            } else if (value instanceof  Boolean) {
                map.putBoolean(key, (Boolean) value);
            } else if (value instanceof  Integer) {
                map.putInt(key, (Integer) value);
            } else if (value instanceof  Double) {
                map.putDouble(key, (Double) value);
            } else if (value instanceof String)  {
                map.putString(key, (String) value);
            } else {
                map.putString(key, value.toString());
            }
        }
        return map;
    }

    public static WritableArray convertJsonToArray(JSONArray jsonArray) throws JSONException {
        WritableArray array = new WritableNativeArray();

        for (int i = 0; i < jsonArray.length(); i++) {
            Object value = jsonArray.get(i);
            if (value instanceof JSONObject) {
                array.pushMap(convertJsonToMap((JSONObject) value));
            } else if (value instanceof  JSONArray) {
                array.pushArray(convertJsonToArray((JSONArray) value));
            } else if (value instanceof  Boolean) {
                array.pushBoolean((Boolean) value);
            } else if (value instanceof  Integer) {
                array.pushInt((Integer) value);
            } else if (value instanceof  Double) {
                array.pushDouble((Double) value);
            } else if (value instanceof String)  {
                array.pushString((String) value);
            } else {
                array.pushString(value.toString());
            }
        }
        return array;
    }

    public static JSONObject convertMapToJson(ReadableMap readableMap) throws JSONException {
        JSONObject object = new JSONObject();
        ReadableMapKeySetIterator iterator = readableMap.keySetIterator();
        while (iterator.hasNextKey()) {
            String key = iterator.nextKey();
            switch (readableMap.getType(key)) {
                case Null:
                    object.put(key, JSONObject.NULL);
                    break;
                case Boolean:
                    object.put(key, readableMap.getBoolean(key));
                    break;
                case Number:
                    object.put(key, readableMap.getDouble(key));
                    break;
                case String:
                    object.put(key, readableMap.getString(key));
                    break;
                case Map:
                    object.put(key, convertMapToJson(readableMap.getMap(key)));
                    break;
                case Array:
                    object.put(key, convertArrayToJson(readableMap.getArray(key)));
                    break;
            }
        }
        return object;
    }

    public static JSONArray convertArrayToJson(ReadableArray readableArray) throws JSONException {
        JSONArray array = new JSONArray();
        for (int i = 0; i < readableArray.size(); i++) {
            switch (readableArray.getType(i)) {
                case Null:
                    break;
                case Boolean:
                    array.put(readableArray.getBoolean(i));
                    break;
                case Number:
                    array.put(readableArray.getDouble(i));
                    break;
                case String:
                    array.put(readableArray.getString(i));
                    break;
                case Map:
                    array.put(convertMapToJson(readableArray.getMap(i)));
                    break;
                case Array:
                    array.put(convertArrayToJson(readableArray.getArray(i)));
                    break;
            }
        }
        return array;
    }

    public static int stringToIntUUID(String input) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest(input.getBytes(StandardCharsets.UTF_8));
            BigInteger bigInteger = new BigInteger(1, hash);
            return Math.abs(bigInteger.intValue());
        } catch (NoSuchAlgorithmException e) {
            e.printStackTrace();
            return 0; // 에러 발생 시 0을 반환하거나 다른 예외 처리를 수행할 수 있습니다.
        }
    }

    public static void sendEventToReact(ReactNativeHost host, String eventName, String data) {
        ReactApplicationContext context = (ReactApplicationContext) host.getReactInstanceManager().getCurrentReactContext();
        if(context != null) {
            context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit(eventName, data);
            CustomSystem.addLogWithData(host, "sendEventToReact context is not null", eventName);
        } else {
            CustomSystem.addLogWithData(host, "sendEventToReact context is null", eventName);
            host.getReactInstanceManager().addReactInstanceEventListener(new ReactInstanceEventListener() {
                public void onReactContextInitialized(ReactContext validContext) {
                    CustomSystem.addLogWithData(host, "sendEventToReact context initialized by event listener", eventName);
                    host.getReactInstanceManager().getCurrentReactContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                            .emit(eventName, data);
                    host.getReactInstanceManager().removeReactInstanceEventListener(this);
                }
            });
        }
    }

    public static String mergePushDataWithMessageId(String pushData, String mId) {
        try {
            JSONObject json = new JSONObject(pushData);
            json.put("mId", mId);
            return json.toString();
        } catch (JSONException e) {
            throw new RuntimeException(e);
        }
    }
}
