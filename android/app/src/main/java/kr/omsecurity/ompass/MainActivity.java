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
import androidx.core.content.ContextCompat;
import androidx.fragment.app.FragmentActivity;

import com.facebook.react.ReactActivity;
import com.facebook.react.ReactActivityDelegate;
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint;
import com.facebook.react.defaults.DefaultReactActivityDelegate;

import com.microsoft.appcenter.AppCenter;
import com.microsoft.appcenter.analytics.Analytics;
import com.microsoft.appcenter.crashes.Crashes;
import kr.omsecurity.ompass.Constants.StaticMethods;
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
    return new DefaultReactActivityDelegate(
            this,
            getMainComponentName(),
            // If you opted-in for the New Architecture, we enable the Fabric Renderer.
            DefaultNewArchitectureEntryPoint.getFabricEnabled());
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
    if(intent.hasExtra("pushData")) {
      String pushData = intent.getStringExtra("pushData");
      CustomSystem.addLogWithData(getReactNativeHost(), "onNewIntent", pushData);
      StaticMethods.sendEventToReact(getReactNativeHost(),"pushEvent", pushData);
      intent.removeExtra("pushData");
    } else {
      CustomSystem.addLogWithData(getReactNativeHost(), "onNewIntent", "No Extra Data");
    }
  }

  @Override
  public void onRestart() {
    super.onRestart();
//    CustomSystem.addLogWithData(getReactNativeHost(), "onRestart", );
  }

  @Override
  protected void onCreate(Bundle savedInstanceState) {
    AppCenter.start(getApplication(), "7e684f19-879f-4795-b617-0e60612b47de", Analytics.class, Crashes.class);
    super.onCreate(null);
    SplashScreen.show(this, R.style.SplashTheme, true);
    isActivityForeground = true;
    activityReference = this;
    createFlag = false;
    getWindow().addFlags(WindowManager.LayoutParams.FLAG_HARDWARE_ACCELERATED);

    Intent intent = getIntent();
    if(intent.hasExtra("pushData")) {
      String pushData = intent.getStringExtra("pushData");
      String mId = intent.getStringExtra("google.message_id");
      String mergeData = StaticMethods.mergePushDataWithMessageId(pushData, mId);
      CustomSystem.addLogWithData(getReactNativeHost(), "onCreate", mergeData);
      StaticMethods.sendEventToReact(getReactNativeHost(), "pushOpenedApp", mergeData);
      intent.removeExtra("pushData");
    } else {
      CustomSystem.addLogWithData(getReactNativeHost(), "onCreate", "No Extra Data");
    }

    NotificationManager notificationManager =
            (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      String channelId = getApplicationContext().getResources().getString(R.string.default_notification_channel_id);
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
//        NotificationChannelGroup group = new NotificationChannelGroup(channelId, channelId);
//        notificationManager.createNotificationChannelGroup(group);
        NotificationChannel channel = new NotificationChannel(channelId, channelId, NotificationManager.IMPORTANCE_HIGH);
//        channel.setGroup(channelId);
        notificationManager.createNotificationChannel(channel);
//        if(notificationManager.getNotificationChannelGroup(channelId) == null) {
//          NotificationChannelGroup group = new NotificationChannelGroup(channelId, channelId);
//          notificationManager.createNotificationChannelGroup(group);
//          group.setDescription("group desc test");
//          if(notificationManager.getNotificationChannel(channelId) == null) {
//            NotificationChannel channel = new NotificationChannel(channelId, channelId, NotificationManager.IMPORTANCE_HIGH);
//            channel.setDescription("channel desc test");
//            channel.setGroup(channelId);
//            notificationManager.createNotificationChannel(channel);
//          }
//        }
      }

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
//    NotificationManager notificationManager =
//            (NotificationManager) getSystemService(Context.NOTIFICATION_SERVICE);
//    String channelId = getApplicationContext().getResources().getString(R.string.channel_title);
//    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
//      notificationManager.deleteNotificationChannel(channelId);
//    }
  }

  @Override
  protected void onDestroy() {
    super.onDestroy();
  }

}
