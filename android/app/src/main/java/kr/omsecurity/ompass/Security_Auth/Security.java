package kr.omsecurity.ompass.Security_Auth;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.Build;
import android.util.Log;
import androidx.annotation.NonNull;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import kr.omsecurity.ompass.Constants.Constants;

import java.io.IOException;
import java.security.GeneralSecurityException;
import java.security.KeyStoreException;
import java.security.NoSuchAlgorithmException;
import java.security.cert.CertificateException;

public class Security extends ReactContextBaseJavaModule {
    private static ReactApplicationContext reactContext;
    private SharedPreferences sharedPreferences;
    private SharedPreferences.Editor editor;

    public Security(ReactApplicationContext context) throws KeyStoreException, CertificateException, NoSuchAlgorithmException, IOException {
        super(context);
        reactContext = context;
        sharedPreferences = reactContext.getSharedPreferences(Constants.app_name, Context.MODE_PRIVATE);
        editor = sharedPreferences.edit();
    }

    @NonNull
    @Override
    public String getName() {
        return "Security";
    }

    @ReactMethod
    public void Verification(Callback callback) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                encrpyt("true", "Verification");
            }
            callback.invoke("success");
        } catch (GeneralSecurityException e) {
            e.printStackTrace();
            callback.invoke("fail");
        } catch (IOException e) {
            e.printStackTrace();
            callback.invoke("fail");
        } catch (javax.security.cert.CertificateException e) {
            e.printStackTrace();
            callback.invoke("fail");
        }
    }

    @ReactMethod
    public void isVerification(Callback callback) {
        if (sharedPreferences.getString("Verification", null) != null) {
            callback.invoke("success");
        } else {
            callback.invoke("fail");
        }
    }

    @ReactMethod
    public void AuthLock(String name, String timeStamp, Callback callback) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                encrpyt(timeStamp, name + "isLock");
            }
            callback.invoke(true);
        } catch (GeneralSecurityException e) {
            e.printStackTrace();
            callback.invoke(false);
        } catch (IOException e) {
            e.printStackTrace();
            callback.invoke(false);
        } catch (javax.security.cert.CertificateException e) {
            e.printStackTrace();
            callback.invoke(false);
        }
    }

    @ReactMethod
    public void isLock(String name, Callback callback) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            callback.invoke(decrypt(name + Constants.il, sharedPreferences.getString(name + "isLock", "")));
        }
    }

    @ReactMethod
    public void errorCountAdd(String name, Callback callback) {
        String count = null;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            count = decrypt(name + Constants.ec, sharedPreferences.getString(name + "errorCount", ""));
        }
        try {
            String val = count != null ? Integer.toString(Integer.parseInt(count) + 1) : "1";
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                encrpyt(val, name + Constants.ec);
            }
            callback.invoke(val);
        } catch (GeneralSecurityException e) {
            e.printStackTrace();
            callback.invoke(false);
        } catch (IOException e) {
            e.printStackTrace();
            callback.invoke(false);
        } catch (javax.security.cert.CertificateException e) {
            e.printStackTrace();
            callback.invoke(false);
        }
    }

    @ReactMethod
    public void getErrorCount(String name, Callback callback) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            callback.invoke(decrypt(name + Constants.ec, sharedPreferences.getString(name + Constants.ec, "")));
        }
    }

    @ReactMethod
    public void resetErrorCount(String name, Callback callback) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                encrpyt("0", name + Constants.ec);
            }
            callback.invoke(true);
        } catch (GeneralSecurityException e) {
            e.printStackTrace();
            callback.invoke(false);
        } catch (IOException e) {
            e.printStackTrace();
            callback.invoke(false);
        } catch (javax.security.cert.CertificateException e) {
            e.printStackTrace();
            callback.invoke(false);
        }
    }

    @ReactMethod
    public void Security(String data, String Auth_Name, String Type, Callback successCallback, Callback errorCallback) {
        if (Type.equals(Constants.rg)) {
            try {
                if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
                    encrpyt(data, Auth_Name);
                }
                successCallback.invoke("success");
            } catch (Exception e) {
                e.printStackTrace();
                errorCallback.invoke("fail");
            }
        } else if (Type.equals(Constants.at)) {
            String dec_string = null;
            if (android.os.Build.VERSION.SDK_INT >= android.os.Build.VERSION_CODES.M) {
                dec_string = decrypt(Auth_Name, sharedPreferences.getString(Auth_Name, ""));
            }
            if (data.equals(dec_string)) {
                successCallback.invoke("success");
            } else {
                errorCallback.invoke("fail");
            }
        }
    }

    @ReactMethod
    public void InitSecurity(Callback successCallback) {
        try {
            encrpyt("0", Constants.pt);
            encrpyt("0", Constants.pn);
            encrpyt("0", Constants.pn + Constants.ec);
            encrpyt("0", Constants.pt + Constants.ec);
            encrpyt("0", Constants.pn + Constants.il);
            encrpyt("0", Constants.pt + Constants.il);
//            encrpyt("0","password");
//            encrpyt("0","motp");
            successCallback.invoke("success");
        } catch (Exception e) {
            e.printStackTrace();
            successCallback.invoke("fail");
        }
    }

    @ReactMethod
    public void Remove(String Auth_Name, Callback successCallback, Callback errorCallback) {
        try {
            editor.remove(Auth_Name).commit();
            successCallback.invoke("success");
        } catch (Exception e) {
            e.printStackTrace();
            errorCallback.invoke("fail");
        }
    }

    @ReactMethod
    public void RemoveAll(Callback successCallback, Callback errorCallback) {
        try {
            encrpyt("0", Constants.pt);
            encrpyt("0", Constants.pn);
//            encrpyt("0","password");
//            encrpyt("0","motp");
            successCallback.invoke("success");
        } catch (Exception e) {
            e.printStackTrace();
            errorCallback.invoke("fail");
        }
    }

    private String encrpyt(String plainText, String alias) throws GeneralSecurityException, IOException, javax.security.cert.CertificateException {
        try {
            String enc_string = OKCipher.encrypt(reactContext, plainText, alias);
            editor.putString(alias, enc_string);
            editor.commit();
            return enc_string;
        } catch (Exception e) {
            Log.e("encrypt error", e.toString());
            return "fail";
        }
    }

    private String decrypt(String alias, String encryptedData) {
        try {
            String decString = OKCipher.decrypt(alias, encryptedData);
            return decString;
        } catch (Exception e) {
            Log.e("decrypt error", e.toString());
            return "fail";
        }
    }
}
