package kr.omsecurity.ompass;
import androidx.annotation.NonNull;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.bridge.*;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.google.android.gms.tasks.OnCompleteListener;
import com.google.android.gms.tasks.Task;
import com.google.firebase.messaging.FirebaseMessaging;

import java.io.IOException;

public class FCMFunctions  extends ReactContextBaseJavaModule {
    private static ReactApplicationContext reactContext;

    public FCMFunctions(ReactApplicationContext context) {
        super(context);
        reactContext = context;
    }

    @NonNull
    @Override
    public String getName() {
        return "FCMFunctions";
    }

    @ReactMethod
    public void getToken(Promise promise) throws IOException {
        Task<String> token = FirebaseMessaging.getInstance().getToken();
        token.addOnCompleteListener(new OnCompleteListener<String>() {
            @Override
            public void onComplete(@NonNull Task<String> task) {
                if(task.isSuccessful()){
                    promise.resolve(task.getResult());
                } else {
                    promise.reject("Get Token Fail!", "Please retry get token request");
                }
            }
        });
    }
}