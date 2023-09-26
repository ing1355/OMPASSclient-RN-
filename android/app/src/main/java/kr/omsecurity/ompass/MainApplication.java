package kr.omsecurity.ompass;

import android.app.Application;
import android.util.Log;
import androidx.annotation.NonNull;
import com.facebook.react.PackageList;
import com.facebook.react.ReactApplication;
import com.facebook.react.ReactNativeHost;
import com.facebook.react.ReactPackage;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactNativeHost;
import com.facebook.soloader.SoLoader;

import com.microsoft.codepush.react.CodePush;
import kr.omsecurity.ompass.Constants.Constants;
import kr.omsecurity.ompass.Security_Auth.SecurityPackage;
import org.jetbrains.annotations.NotNull;

import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;
import java.text.SimpleDateFormat;
import java.util.Date;
import java.util.List;

import static kr.omsecurity.ompass.ReactNativeFlipper.initializeFlipper;

public class MainApplication extends Application implements ReactApplication {
  public static ReactApplicationContext reactApplicationContext;
  private Thread.UncaughtExceptionHandler mDefaultUncaughtExceptionHandler;
  public static String ExceptionSharedPreferencesKey = "UncaughtException";

  public Thread.UncaughtExceptionHandler getDefaultUncaughtExceptionHandler() {
    return mDefaultUncaughtExceptionHandler;
  }
  private final ReactNativeHost mReactNativeHost =
      new DefaultReactNativeHost(this) {
        @Override
        public boolean getUseDeveloperSupport() {
          return BuildConfig.DEBUG;
        }

        @Override
        protected List<ReactPackage> getPackages() {
          @SuppressWarnings("UnnecessaryLocalVariable")
          List<ReactPackage> packages = new PackageList(this).getPackages();
            packages.add(new ReactPackages());
            packages.add(new SecurityPackage());
          // Packages that cannot be autolinked yet can be added manually here, for example:
          // packages.add(new MyReactNativePackage());
          return packages;
        }

        @Override
        protected String getJSBundleFile() {
          return CodePush.getJSBundleFile();
        }

        @Override
        protected String getJSMainModuleName() {
          return "index";
        }
        @Override
        protected boolean isNewArchEnabled() {
          return BuildConfig.IS_NEW_ARCHITECTURE_ENABLED;
        }
      };

  @Override
  public ReactNativeHost getReactNativeHost() {
    return mReactNativeHost;
  }

  @Override
  public void onCreate() {
    super.onCreate();
    SoLoader.init(this, /* native exopackage */ false);
    mDefaultUncaughtExceptionHandler = Thread.getDefaultUncaughtExceptionHandler();
    Thread.setDefaultUncaughtExceptionHandler(new UncaughtExceptionHandler());
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      // If you opted-in for the New Architecture, we load the native entry point for this app.
      DefaultNewArchitectureEntryPoint.load();
    }
    initializeFlipper(this, getReactNativeHost().getReactInstanceManager());
  }

  private class UncaughtExceptionHandler implements Thread.UncaughtExceptionHandler {
    @Override
    public void uncaughtException(@NonNull @NotNull Thread t, @NonNull @NotNull Throwable e) {
      e.printStackTrace();
      try {
        Date date = new Date(System.currentTimeMillis());
        SimpleDateFormat format = new SimpleDateFormat("yyyy-MM-dd HH:mm:ss");
        String time = format.format(date);
        BufferedWriter writer = new BufferedWriter(new FileWriter(getFilesDir().getAbsolutePath() + '/' + Constants.LogFileName, true));
        writer.write("[" + time + "] - " + "UncaughtExceptionHandler" + " - " + Log.getStackTraceString(e));
        writer.newLine();
        writer.newLine();
        writer.flush();
        writer.close();
      } catch (IOException ex) {
        ex.printStackTrace();
        throw new RuntimeException(ex);
      }

      mDefaultUncaughtExceptionHandler.uncaughtException(t, e);
    }
  }
}
