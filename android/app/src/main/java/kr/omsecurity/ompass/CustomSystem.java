package kr.omsecurity.ompass;

import android.annotation.SuppressLint;
import android.app.NotificationManager;
import android.content.ActivityNotFoundException;
import android.content.Context;
import android.content.Intent;
import android.os.Build;
import android.os.Handler;
import android.os.Process;
import android.provider.Settings;

import android.util.Log;
import androidx.annotation.NonNull;
import androidx.annotation.RequiresApi;

import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import kr.omsecurity.ompass.Constants.Constants;
import kr.omsecurity.ompass.Constants.StaticMethods;

import java.io.BufferedWriter;
import java.io.File;
import java.io.FileWriter;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.Objects;

public class CustomSystem extends ReactContextBaseJavaModule {
    private static ReactApplicationContext reactContext;

    @SuppressLint("CommitPrefEdits")
    public CustomSystem(ReactApplicationContext context) {
        super(context);
        reactContext = context;
    }

    @Override
    @NonNull
    public String getName() {
        return "CustomSystem";
    }

    @ReactMethod
    public void ExitApp() {
        new Handler().postDelayed(new Runnable() {
            @Override
            public void run() {
                Objects.requireNonNull(reactContext.getCurrentActivity()).moveTaskToBack(true);
                Objects.requireNonNull(reactContext.getCurrentActivity()).finishAndRemoveTask();
                Process.killProcess(Process.myPid());
            }
        }, 1);
    }

    @ReactMethod
    public void cancelNotification(String accessKey) {
        NotificationManager notificationManager = (NotificationManager) getReactApplicationContext().getSystemService(Context.NOTIFICATION_SERVICE);
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            notificationManager.cancel(StaticMethods.stringToIntUUID(accessKey));
        }
    }

    @ReactMethod
    public void GoToSetting() {
        Intent intent = null;
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            intent = notificationSettingOreo(reactContext);
        } else {
            intent = notificationSettingOreoLess(reactContext);
        }
        try {
            reactContext.startActivity(intent);
        } catch (ActivityNotFoundException e) {
            e.printStackTrace();
        }
    }

    @RequiresApi(Build.VERSION_CODES.O)
    private Intent notificationSettingOreo(ReactContext context) {
        Intent intent = new Intent();
        intent.setAction(Settings.ACTION_APP_NOTIFICATION_SETTINGS);
        intent.putExtra(Settings.EXTRA_APP_PACKAGE, context.getPackageName());
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        return intent;
    }

    private Intent notificationSettingOreoLess(ReactContext context) {
        Intent intent = new Intent();
        intent.setAction("android.settings.APP_NOTIFICATION_SETTINGS");
        intent.putExtra("app_package", context.getPackageName());
        intent.putExtra("app_uid", context.getApplicationInfo().uid);
        intent.setFlags(Intent.FLAG_ACTIVITY_NEW_TASK);
        return intent;
    }

    public static void setReactApplicationContext(ReactApplicationContext context) {
        reactContext = context;
    }

    public static ReactApplicationContext getReactContext() {
        return reactContext;
    }

    @ReactMethod
    public void LogNative(String tag, String txt) {
        Log.d(tag != null ? tag : "ProdLog", txt);
    }

    public static void addLogWithData(ReactNativeHost host, String tag, String data) {
        ReactApplicationContext context = (ReactApplicationContext) host.getReactInstanceManager().getCurrentReactContext();
        if(context != null) {
            File file = new File(context.getFilesDir().getAbsolutePath() + "/" + Constants.LogFileName);
            writeToFileLog(file, tag, data);
        } else {
            host.getReactInstanceManager().addReactInstanceEventListener(new ReactInstanceManager.ReactInstanceEventListener() {
                public void onReactContextInitialized(ReactContext validContext) {
                    File file = new File(host.getReactInstanceManager().getCurrentReactContext().getFilesDir().getAbsolutePath() + "/" + Constants.LogFileName);
                    writeToFileLog(file, tag, data);
                    host.getReactInstanceManager().removeReactInstanceEventListener(this);
                }
            });
        }
    }

    public static void addLogWithData(ReactNativeHost host, String tag, String data, String params) {
        ReactApplicationContext context = (ReactApplicationContext) host.getReactInstanceManager().getCurrentReactContext();
        if(context != null) {
            File file = new File(context.getFilesDir().getAbsolutePath() + "/" + Constants.LogFileName);
            writeToFileLog(file, tag, data, params);
        } else {
            host.getReactInstanceManager().addReactInstanceEventListener(new ReactInstanceManager.ReactInstanceEventListener() {
                public void onReactContextInitialized(ReactContext validContext) {
                    File file = new File(validContext.getFilesDir().getAbsolutePath() + "/" + Constants.LogFileName);
                    writeToFileLog(file, tag, data, params);
                    host.getReactInstanceManager().removeReactInstanceEventListener(this);
                }
            });
        }
    }

    private static void writeToFileLog(File file, String tag, String data) {
        Date date = new Date(System.currentTimeMillis());
        SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        String time = format.format(date);
        if(BuildConfig.DEBUG) Log.d("notification", tag + " " + data);
        if(!file.exists()) {
            try {
                file.createNewFile();
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }
        try {
            BufferedWriter writer = new BufferedWriter(new FileWriter(file, true));
            writer.write("[" + time + "] - " + tag + " - " + data);
            writer.newLine();
            writer.newLine();
            writer.flush();
            writer.close();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }
    private static void writeToFileLog(File file, String tag, String data, String params) {
        Date date = new Date(System.currentTimeMillis());
        SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        String time = format.format(date);
        if(BuildConfig.DEBUG) Log.d("notification", tag + " " + data);
        if(!file.exists()) {
            try {
                file.createNewFile();
            } catch (IOException e) {
                throw new RuntimeException(e);
            }
        }
        try {
            BufferedWriter writer = new BufferedWriter(new FileWriter(file, true));
            writer.write("[" + time + "] - " + tag + " - " + data);
            writer.newLine();
            writer.write("[" + time + "] - " + tag + " - " + params);
            writer.newLine();
            writer.newLine();
            writer.flush();
            writer.close();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }
    }

}
