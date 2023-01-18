package kr.omsecurity.ompass;

import static android.hardware.biometrics.BiometricPrompt.BIOMETRIC_ERROR_LOCKOUT;
import static android.hardware.biometrics.BiometricPrompt.BIOMETRIC_ERROR_LOCKOUT_PERMANENT;

import android.annotation.SuppressLint;
import android.content.Intent;

import androidx.biometric.BiometricManager;
import androidx.biometric.BiometricPrompt;
import android.os.Build;
import android.provider.Settings;
import android.util.Log;
import android.widget.Toast;
import androidx.annotation.NonNull;
import androidx.annotation.RequiresApi;
import androidx.core.content.ContextCompat;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import kr.omsecurity.ompass.webauthn.AuthenticatorManager;
import org.json.JSONObject;
import java.net.UnknownHostException;
import java.util.Objects;
import java.util.concurrent.Executor;

import static com.facebook.react.bridge.UiThreadUtil.runOnUiThread;
import static kr.omsecurity.ompass.MainActivity.activityReference;

public class Auth extends ReactContextBaseJavaModule {
    private static ReactApplicationContext reactContext;
    public static String authenticateToken;
    public static String err_msg;

    public Auth(ReactApplicationContext context) {
        super(context);
        reactContext = context;
        authenticateToken = null;
        err_msg = null;
    }

    @Override
    @NonNull
    public String getName() {
        return "webAuthn";
    }

    @ReactMethod
    public void PushAuth(Callback data) {
        try {
            String push_data = Objects.requireNonNull(reactContext.getCurrentActivity()).getIntent().getStringExtra("data");
            reactContext.getCurrentActivity().getIntent().putExtra("data",(String)null);
            data.invoke(push_data);
        } catch(NullPointerException e) {
            e.printStackTrace();
        }

    }

    @RequiresApi(api = Build.VERSION_CODES.P)
    @ReactMethod
    public void PreRegister(String fidoAddress, String domain, String accessKey, String username,
                            String displayName, String redirectUri, int did,
                            Callback errorCallback, Callback successCallback) throws UnknownHostException{
//        HttpsTrustManager.allowAllSSL();
        err_msg = null;
            AuthenticatorManager authenticatorManager = new AuthenticatorManager(reactContext, fidoAddress, domain, accessKey, username);
            JSONObject jsonObject = authenticatorManager.preRegister(username, displayName, redirectUri, did);
            if (err_msg == null) {
                successCallback.invoke(jsonObject.toString());
            } else {
                errorCallback.invoke(err_msg);
            }
    }

    @RequiresApi(api = Build.VERSION_CODES.P)
    @ReactMethod
    public void Register(String fidoAddress, String domain, String accessKey, String username, String clientInfo,
                         String displayName, String pushToken, String authorization, String challenge, String userId,
                         Callback errorCallback, Callback successCallback) {
//        HttpsTrustManager.allowAllSSL();
        err_msg = null;
        AuthenticatorManager authenticatorManager = new AuthenticatorManager(reactContext, fidoAddress, domain, accessKey, username);
        authenticatorManager.tryRegister(pushToken, username, displayName, authorization, challenge, userId, clientInfo);
        if (err_msg == null) {
            successCallback.invoke("Register success!");
        } else {
            errorCallback.invoke(err_msg);
        }
    }

    @RequiresApi(api = Build.VERSION_CODES.P)
    @ReactMethod
    public void PreAuthenticate(String fidoAddress, String domain, String accessKey,
                                String redirectUri, int did, String username,
                                Callback errorCallback, Callback successCallback) {
//        HttpsTrustManager.allowAllSSL();
        err_msg = null;
        AuthenticatorManager authenticatorManager = new AuthenticatorManager(reactContext, fidoAddress, domain, accessKey, username);
        JSONObject jsonObject = authenticatorManager.preAuthenticate(redirectUri, did, username);
        if (err_msg == null) {
            successCallback.invoke(jsonObject.toString());
        } else {
            errorCallback.invoke(err_msg);
        }
    }

    @RequiresApi(api = Build.VERSION_CODES.P)
    @ReactMethod
    public void Authenticate(String pushToken, String fidoAddress, String domain, String accessKey, String username,
                             String authorization, String challenge, String userId, String clientInfo,
                             Callback errorCallback, Callback successCallback) {
//        HttpsTrustManager.allowAllSSL();
        err_msg = null;
        AuthenticatorManager authenticatorManager = new AuthenticatorManager(reactContext, fidoAddress, domain, accessKey, username);
        authenticatorManager.tryAuthenticate(username, authorization, challenge, userId, pushToken, clientInfo);
        if (err_msg == null) {
            successCallback.invoke(authenticateToken);
        } else {
            errorCallback.invoke(err_msg);
        }
    }

    @RequiresApi(api = Build.VERSION_CODES.LOLLIPOP)
    @ReactMethod
    public void biometric(String title, Callback successCallback, Callback errorCallback) {
        Executor executor;
        BiometricPrompt biometricPrompt;
        BiometricPrompt.PromptInfo promptInfo;
        executor = ContextCompat.getMainExecutor(reactContext);
        biometricPrompt = new BiometricPrompt(activityReference, executor, new BiometricPrompt.AuthenticationCallback() {
            @SuppressLint("WrongConstant")
            @Override
            public void onAuthenticationError(int errorCode,
                                              @NonNull CharSequence errString) {
                super.onAuthenticationError(errorCode, errString);
                switch (errorCode) {
                    case BiometricManager.BIOMETRIC_ERROR_NO_HARDWARE:
                        Log.e("MY_APP_TAG", "No biometric features available on this device.");
                        errorCallback.invoke("생체 인증장치가 존재하지 않습니다.");
                        Toast.makeText(reactContext,
                                "생체 인증장치가 존재하지 않습니다.", Toast.LENGTH_SHORT)
                                .show();
                        break;
                    case BiometricManager.BIOMETRIC_ERROR_HW_UNAVAILABLE:
                        Log.e("MY_APP_TAG", "Biometric features are currently unavailable.");
                        errorCallback.invoke("생체 인증장치를 사용할 수 없습니다.");
                        Toast.makeText(reactContext,
                                "생체 인증장치를 사용할 수 없습니다.", Toast.LENGTH_SHORT)
                                .show();
                        break;
                    case BiometricManager.BIOMETRIC_ERROR_NONE_ENROLLED:
                        Log.e("MY_APP_TAG", "The user does not have any biometrics enrolled.");
                        errorCallback.invoke("등록된 생체 인증 정보가 존재하지 않습니다.");
                        break;
                    case BIOMETRIC_ERROR_LOCKOUT:
                    case BIOMETRIC_ERROR_LOCKOUT_PERMANENT:
                        Log.e("MY_APP_TAG", "The user does not have any biometrics enrolled.");
                        errorCallback.invoke("생체 인증 잠금!");
                        break;
                }
            }

            @Override
            public void onAuthenticationSucceeded(
                    @NonNull BiometricPrompt.AuthenticationResult result) {
                super.onAuthenticationSucceeded(result);
                successCallback.invoke("인증 성공!");
            }
        });

        promptInfo = new BiometricPrompt.PromptInfo.Builder()
                .setTitle(title)
                .setNegativeButtonText("취소")
                .build();

        runOnUiThread(() -> biometricPrompt.authenticate(promptInfo));
    }

    @ReactMethod
    public void EnrollBiometric() {
        Intent intent = new Intent(Settings.ACTION_SECURITY_SETTINGS);
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        reactContext.startActivity(intent);
    }
}