package kr.omsecurity.ompass;
import androidx.annotation.NonNull;
import com.facebook.react.bridge.Promise;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
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