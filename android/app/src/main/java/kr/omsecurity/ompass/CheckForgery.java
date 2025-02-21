package kr.omsecurity.ompass;

import android.annotation.SuppressLint;
import android.content.pm.PackageManager;
import android.os.Build;
import android.util.Log;

import androidx.annotation.NonNull;
import com.facebook.react.bridge.*;
import kr.omsecurity.ompass.Constants.StaticMethods;
import org.json.JSONException;
import org.json.JSONObject;

import javax.net.ssl.HttpsURLConnection;
import javax.net.ssl.SSLHandshakeException;
import java.io.*;
import java.net.ConnectException;
import java.net.MalformedURLException;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.security.*;
import java.security.cert.CertificateException;
import java.util.Iterator;

import static kr.omsecurity.ompass.webauthn.AuthenticatorManager.insertCAContext;

public class CheckForgery extends ReactContextBaseJavaModule {
    private static ReactApplicationContext reactContext;

    @SuppressLint("CommitPrefEdits")
    public CheckForgery(ReactApplicationContext context) {
        super(context);
        reactContext = context;
    }

    @Override
    @NonNull
    public String getName() {
        return "checkForgery";
    }

    @ReactMethod
    public void isForgery(Callback successCallback, Callback errorCallback) {
        String err_msg = null;
        try {
            String installer = null;
            PackageManager pm = reactContext.getPackageManager();
            String packageName = reactContext.getPackageName();
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.R) {
                try {
                    installer = pm.getInstallSourceInfo(packageName).getInstallingPackageName();
                } catch (PackageManager.NameNotFoundException e) {
                    e.printStackTrace();
                }
            } else {
                installer = pm.getInstallerPackageName(packageName);
            }
            if (BuildConfig.DEBUG || (installer != null && installer.startsWith("com.android.vending"))) {
//            if (true) {
                URL urlAuthenticate = new URL("https://admin-api.ompasscloud.com/oms/app-verification/os/android/version/" + BuildConfig.VERSION_NAME);
                HttpsURLConnection conCheckForgery = null;
                conCheckForgery = (HttpsURLConnection) urlAuthenticate.openConnection();
                conCheckForgery.setSSLSocketFactory(insertCAContext(R.raw.thawte_rsa_ca_2018, reactContext).getSocketFactory());
                conCheckForgery.setRequestMethod("GET");
                conCheckForgery.setRequestProperty("Content-Type", "application/json; utf-8");
                conCheckForgery.setRequestProperty("Accept", "application/json");
                conCheckForgery.setConnectTimeout(5000);

                try (BufferedReader br = new BufferedReader(
                        new InputStreamReader(conCheckForgery.getInputStream(), StandardCharsets.UTF_8))) {
                    StringBuilder response = new StringBuilder();
                    String responseLine = null;
                    while ((responseLine = br.readLine()) != null) {
                        response.append(responseLine.trim());
                    }
                    JSONObject json = new JSONObject(response.toString());
                    JSONObject jsonData = json.getJSONObject("data");
                    jsonData.put("hash", true);
                    successCallback.invoke(StaticMethods.convertJsonToMap(jsonData));
                } catch (FileNotFoundException | SSLHandshakeException | ConnectException e) {
                    e.printStackTrace();
                    err_msg = "Server Connection Error";
                }
            } else {
                WritableMap result = new WritableNativeMap();
                result.putBoolean("hash", false);
                successCallback.invoke(result);
            }
        } catch (IOException | NoSuchAlgorithmException | CertificateException | KeyStoreException |
                 KeyManagementException | JSONException e) {
            e.printStackTrace();
            err_msg = "Internel Error";
        }
        if (err_msg != null) errorCallback.invoke(err_msg);
    }
}