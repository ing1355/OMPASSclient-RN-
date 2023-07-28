package kr.omsecurity.ompass;

import android.Manifest;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.content.Context;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.os.Build;
import android.os.Bundle;
import android.view.WindowManager;
import androidx.activity.result.ActivityResultLauncher;
import androidx.activity.result.contract.ActivityResultContracts;
import androidx.annotation.Nullable;
import androidx.core.content.ContextCompat;
import androidx.fragment.app.FragmentActivity;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.ReactInstanceManager;
import com.facebook.react.ReactRootView;

import com.facebook.react.bridge.ReactContext;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import org.devio.rn.splashscreen.SplashScreen;

public class MainActivity extends ReactActivity {

  public static boolean isActivityForeground = false;
  public static FragmentActivity activityReference;
  boolean createFlag = true;

  @Override
  protected String getMainComponentName() {
    return "ompass";
  }

  @Override
  protected ReactActivityDelegate createReactActivityDelegate() {
    return new MainActivityDelegate(this, getMainComponentName()) {
      @Nullable
      @Override
      protected Bundle getLaunchOptions() {
        String searchedData = getIntent().getStringExtra("data");
        Bundle bundle = new Bundle();
        bundle.putString("data", searchedData);
        return bundle;
      }
    };
  }

  public static class MainActivityDelegate extends ReactActivityDelegate {
    public MainActivityDelegate(ReactActivity activity, String mainComponentName) {
      super(activity, mainComponentName);
    }

    @Override
    protected ReactRootView createRootView() {
      ReactRootView reactRootView = new ReactRootView(getContext());
      // If you opted-in for the New Architecture, we enable the Fabric Renderer.
      reactRootView.setIsFabric(com.swmansion.reanimated.BuildConfig.IS_NEW_ARCHITECTURE_ENABLED);
      return reactRootView;
    }

    @Override
    protected boolean isConcurrentRootEnabled() {
      // If you opted-in for the New Architecture, we enable Concurrent Root (i.e. React 18).
      // More on this on https://reactjs.org/blog/2022/03/29/react-v18.html
      return com.swmansion.reanimated.BuildConfig.IS_NEW_ARCHITECTURE_ENABLED;
    }
  }

  private final ActivityResultLauncher<String> requestPermissionLauncher =
          registerForActivityResult(new ActivityResultContracts.RequestPermission(), isGranted -> {
            if (isGranted) {
              // FCM SDK (and your app) can post notifications.
            } else {
              // TODO: Inform user that that your app will not show notifications.
            }
          });

  private void askNotificationPermission() {
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
      if (ContextCompat.checkSelfPermission(this, Manifest.permission.POST_NOTIFICATIONS) ==
              PackageManager.PERMISSION_GRANTED) {
      } else if (shouldShowRequestPermissionRationale(Manifest.permission.POST_NOTIFICATIONS)) {

      } else {
        requestPermissionLauncher.launch(Manifest.permission.POST_NOTIFICATIONS);
      }
    }
  }

  @Override
  public void onNewIntent(Intent intent) {
    super.onNewIntent(intent);
    String pushData = intent.getStringExtra("data");
    System.out.println("onNewIntent : " + pushData);
    if (pushData != null) {
      ReactInstanceManager reactInstanceManager = getReactNativeHost().getReactInstanceManager();
      ReactContext reactContext = reactInstanceManager.getCurrentReactContext();
      if (reactContext != null) {
        reactContext.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit("pushEvent", pushData);
      } else {
        reactInstanceManager.addReactInstanceEventListener(new ReactInstanceManager.ReactInstanceEventListener() {
          @Override
          public void onReactContextInitialized(ReactContext context) {
            context.getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                    .emit("pushEvent", pushData);
            reactInstanceManager.removeReactInstanceEventListener(this);
          }
        });
      }
    }
  }

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    super.onCreate(null);
    SplashScreen.show(this, R.style.SplashTheme, true);
    isActivityForeground = true;
    activityReference = this;
    createFlag = false;
    getWindow().addFlags(WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED);
    NotificationManager notificationManager =
            (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      NotificationChannel channel = new NotificationChannel("Channel ID",
              "Channel human readable title",
              NotificationManager.IMPORTANCE_HIGH);
      notificationManager.createNotificationChannel(channel);
    }
  }

  @Override
  protected void onResume() {
    super.onResume();
    isActivityForeground = true;
  }

  @Override
  protected void onPause() {
    super.onPause();
    isActivityForeground = false;
    createFlag = true;
  }
}
