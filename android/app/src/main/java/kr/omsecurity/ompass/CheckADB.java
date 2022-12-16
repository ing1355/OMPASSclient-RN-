package kr.omsecurity.ompass;

import android.provider.Settings;
import androidx.annotation.NonNull;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

import static android.provider.Settings.Global.ADB_ENABLED;

public class CheckADB extends ReactContextBaseJavaModule {
    private static ReactApplicationContext reactContext;

    public CheckADB(ReactApplicationContext context) {
        super(context);
        reactContext = context;
    }

    @Override
    @NonNull
    public String getName() {
        return "CheckADB";
    }

    @ReactMethod
    public void isADB(Callback successCallback) {
        successCallback.invoke(Settings.Secure.getInt(reactContext.getContentResolver(), ADB_ENABLED, 0) != 0);
    }
}